// src/core/ticket/ticket.service.js
const { Ticket } = require('../../models');
const { Op } = require('sequelize');

const ESTADOS = {
    REPORTADO: 'REPORTADO',
    EN_DEV: 'EN_DEV',
    EN_QA: 'EN_QA',
    CERRADO: 'CERRADO',
};

const TRANSICIONES_VALIDAS = {
    [ESTADOS.REPORTADO]: [ESTADOS.EN_DEV],                  // Reportado -> En Dev
    [ESTADOS.EN_DEV]: [ESTADOS.EN_QA],                      // En Dev -> En QA
    [ESTADOS.EN_QA]: [ESTADOS.EN_DEV, ESTADOS.CERRADO],     // En QA -> En Dev o Cerrado
    [ESTADOS.CERRADO]: [],                                  // Cerrado ya no se mueve
};

// Severidades y entornos válidos
const SEVERIDADES_VALIDAS = ['Alta', 'Media', 'Baja'];
const ENTORNOS_VALIDOS = ['QA', 'PROD'];

// =========================
// Helpers de validación
// =========================

function validarTicketCreate(data) {
    const errores = [];

    // Obligatorios
    if (!data.proyecto) errores.push('proyecto es obligatorio');
    if (!data.severidad) errores.push('severidad es obligatoria');
    if (!data.entorno) errores.push('entorno es obligatorio');
    if (!data.descripcionBreve) errores.push('descripcionBreve es obligatoria');

    // Dominio de severidad
    if (data.severidad && !SEVERIDADES_VALIDAS.includes(data.severidad)) {
        errores.push(
            `severidad inválida (válidas: ${SEVERIDADES_VALIDAS.join(', ')})`
        );
    }

    // Dominio de entorno
    if (data.entorno && !ENTORNOS_VALIDOS.includes(data.entorno)) {
        errores.push(
            `entorno inválido (válidos: ${ENTORNOS_VALIDOS.join(', ')})`
        );
    }

    if (errores.length > 0) {
        const err = new Error(errores.join('; '));
        err.status = 400;
        throw err;
    }
}

function validarTicketUpdate(data) {
    const errores = [];

    if (data.severidad && !SEVERIDADES_VALIDAS.includes(data.severidad)) {
        errores.push(
            `severidad inválida (válidas: ${SEVERIDADES_VALIDAS.join(', ')})`
        );
    }

    if (data.entorno && !ENTORNOS_VALIDOS.includes(data.entorno)) {
        errores.push(
            `entorno inválido (válidos: ${ENTORNOS_VALIDOS.join(', ')})`
        );
    }

    if (errores.length > 0) {
        const err = new Error(errores.join('; '));
        err.status = 400;
        throw err;
    }
}

function validarTransicion(estadoActual, estadoNuevo) {
    if (estadoActual === estadoNuevo) return true;
    const permitidos = TRANSICIONES_VALIDAS[estadoActual] || [];
    return permitidos.includes(estadoNuevo);
}

// =========================
// Helpers de mes (YYYY-MM)
// =========================

// Si no mandan month, usamos el mes actual
function normalizarMes(monthStr) {
    if (!monthStr) {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}`;
    }
    return monthStr;
}

function getMonthRangeFromStr(monthStr) {
    const [yearStr, monthOnlyStr] = monthStr.split('-');
    const year = Number(yearStr);
    const monthIndex = Number(monthOnlyStr) - 1; // 0 = enero

    const start = new Date(year, monthIndex, 1, 0, 0, 0);
    const end = new Date(year, monthIndex + 1, 1, 0, 0, 0); // primer día del siguiente mes

    return { start, end };
}

// =========================
// Listado de tickets
// =========================

// Listar TODOS (por si lo quieres usar en algún reporte global)
exports.listTickets = async () => {
    const tickets = await Ticket.findAll({
        order: [['id', 'DESC']],
    });
    return tickets;
};

// Listar tickets por mes (reporteQa) + abiertos de meses anteriores
// monthStr: 'YYYY-MM' (ej. '2025-01'). Si viene vacío, se usa el mes actual.
exports.listTicketsByMonth = async (monthStr) => {
    const m = normalizarMes(monthStr);
    const { start, end } = getMonthRangeFromStr(m);

    // Tickets reportados en el mes
    const enMes = {
        reporteQa: {
            [Op.gte]: start,
            [Op.lt]: end,
        },
    };

    // Tickets reportados ANTES de ese mes que SIGUEN abiertos
    const abiertosAntes = {
        estado: {
            [Op.ne]: ESTADOS.CERRADO,
        },
        reporteQa: {
            [Op.lt]: start,
        },
    };

    return Ticket.findAll({
        where: {
            [Op.or]: [enMes, abiertosAntes],
        },
        order: [['reporteQa', 'ASC']],
    });
};

// =========================
// CRUD
// =========================

// Obtener un ticket por ID
exports.getTicketById = async (id) => {
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
        const error = new Error('Ticket no encontrado');
        error.status = 404;
        throw error;
    }
    return ticket;
};

// Crear ticket
exports.createTicket = async (data, user = null) => {
    validarTicketCreate(data);
    const ahora = new Date();

    const payload = {
        proyecto: data.proyecto,
        modulo: data.modulo,
        cliente: data.cliente,
        severidad: data.severidad,
        ticket: data.ticket,
        entorno: data.entorno,

        // Estado inicial SIEMPRE REPORTADO
        estado: ESTADOS.REPORTADO,

        // Si no mandan fecha de reporte, la ponemos ahora
        reporteQa: data.reporteQa || ahora,

        envioDev: null,
        retornoQa: null,
        cierre: null,
        vecesDevuelto: 0,

        descripcionBreve: data.descripcionBreve,
        responsableDev: data.responsableDev,
        horasQa: data.horasQa,
        linkDocumento: data.linkDocumento,
        creadoPorId: user?.id || null,
    };

    const nuevo = await Ticket.create(payload);
    return nuevo;
};

// Actualizar ticket
exports.updateTicket = async (id, data, user = null) => {
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
        const error = new Error('Ticket no encontrado');
        error.status = 404;
        throw error;
    }

    validarTicketUpdate(data);

    const estadoActual = ticket.estado;
    let estadoNuevo = data.estado ?? estadoActual;

    // Validar estado
    if (!Object.values(ESTADOS).includes(estadoNuevo)) {
        const error = new Error('Estado inválido');
        error.status = 400;
        throw error;
    }

    // Validar transición
    if (!validarTransicion(estadoActual, estadoNuevo)) {
        const error = new Error(
            `Transición de estado no permitida: ${estadoActual} -> ${estadoNuevo}`
        );
        error.status = 400;
        throw error;
    }

    const ahora = new Date();
    let envioDev = ticket.envioDev;
    let retornoQa = ticket.retornoQa;
    let cierre = ticket.cierre;
    let vecesDevuelto = ticket.vecesDevuelto;

    // Permitir override manual desde el body si lo mandan
    if (data.envioDev) envioDev = data.envioDev;
    if (data.retornoQa) retornoQa = data.retornoQa;
    if (data.cierre) cierre = data.cierre;
    if (typeof data.vecesDevuelto === 'number') vecesDevuelto = data.vecesDevuelto;

    // --- LÓGICA AUTOMÁTICA POR CAMBIO DE ESTADO ---

    // REPORTADO -> EN_DEV
    if (estadoActual !== ESTADOS.EN_DEV && estadoNuevo === ESTADOS.EN_DEV) {
        if (!envioDev) envioDev = ahora;
    }

    // EN_DEV -> EN_QA  → retornoQa y vecesDevuelto++
    if (estadoActual === ESTADOS.EN_DEV && estadoNuevo === ESTADOS.EN_QA) {
        if (!retornoQa) retornoQa = ahora;
        vecesDevuelto = (vecesDevuelto || 0) + 1;
    }

    // Cualquier -> CERRADO
    if (estadoActual !== ESTADOS.CERRADO && estadoNuevo === ESTADOS.CERRADO) {
        if (!cierre) cierre = ahora;
    }

    await ticket.update({
        proyecto: data.proyecto ?? ticket.proyecto,
        modulo: data.modulo ?? ticket.modulo,
        cliente: data.cliente ?? ticket.cliente,
        severidad: data.severidad ?? ticket.severidad,
        ticket: data.ticket ?? ticket.ticket,
        entorno: data.entorno ?? ticket.entorno,

        estado: estadoNuevo,

        reporteQa: data.reporteQa ?? ticket.reporteQa,
        envioDev,
        retornoQa,
        cierre,
        vecesDevuelto,

        descripcionBreve: data.descripcionBreve ?? ticket.descripcionBreve,
        responsableDev: data.responsableDev ?? ticket.responsableDev,
        horasQa: data.horasQa ?? ticket.horasQa,
        linkDocumento: data.linkDocumento ?? ticket.linkDocumento,
    });

    return ticket;
};

// Eliminar ticket
exports.deleteTicket = async (id) => {
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
        const error = new Error('Ticket no encontrado');
        error.status = 404;
        throw error;
    }
    await ticket.destroy();
    return { message: 'Ticket eliminado' };
};
