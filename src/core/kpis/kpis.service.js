const { Ticket, TicketWorklog } = require('../../models');
const { Op, fn, col, literal } = require('sequelize');

// ===== helpers mes =====
function normalizarMes(monthStr) {
    if (!monthStr) return null;
    return String(monthStr).trim();
}

function getMonthRange(monthStr) {
    const [yStr, mStr] = monthStr.split('-');
    const year = Number(yStr);
    const monthIndex = Number(mStr) - 1;

    if (!year || monthIndex < 0 || monthIndex > 11) {
        const err = new Error('month inválido, usa formato YYYY-MM');
        err.status = 400;
        throw err;
    }

    const start = new Date(year, monthIndex, 1, 0, 0, 0);
    const endExclusive = new Date(year, monthIndex + 1, 1, 0, 0, 0);

    // para DATEONLY (worklogs.fecha) en formato YYYY-MM-DD
    const startStr = start.toISOString().slice(0, 10);
    const endLastDay = new Date(year, monthIndex + 1, 0, 0, 0, 0); // último día del mes
    const endStr = endLastDay.toISOString().slice(0, 10);

    return { start, endExclusive, startStr, endStr };
}

// ===== filtro por rol (para no filtrar en front y listo) =====
function filtrarPorRol(payload, rol) {
    const base = {
        month: payload.month,
        totals: payload.totals,
        porEstado: payload.porEstado,
        porSeveridad: payload.porSeveridad,
    };

    if (rol === 'QA') {
        return {
            ...base,
            qa: payload.qa,
        };
    }

    if (rol === 'PM') {
        return {
            ...base,
            pm: payload.pm,
        };
    }

    // ADMIN ve todo
    return payload;
}

// ===== service principal =====
exports.getKpis = async ({ month, user }) => {
    const rol = user?.rol || 'QA';
    const m = normalizarMes(month);

    // where tickets
    const whereTicket = {};
    // where worklogs
    const whereWl = {};

    if (m) {
        const { start, endExclusive, startStr, endStr } = getMonthRange(m);

        // tickets del mes por reporteQa
        whereTicket.reporteQa = { [Op.gte]: start, [Op.lt]: endExclusive };

        // worklogs del mes por fecha (DATEONLY)
        whereWl.fecha = { [Op.between]: [startStr, endStr] };
    }

    // ===== KPIs comunes =====
    const totalTickets = await Ticket.count({ where: whereTicket });

    const cerrados = await Ticket.count({
        where: { ...whereTicket, estado: 'CERRADO' },
    });

    const abiertos = await Ticket.count({
        where: { ...whereTicket, estado: { [Op.ne]: 'CERRADO' } },
    });

    const porEstadoRaw = await Ticket.findAll({
        attributes: ['estado', [fn('COUNT', col('id')), 'count']],
        where: whereTicket,
        group: ['estado'],
        raw: true,
    });

    const porSeveridadRaw = await Ticket.findAll({
        attributes: ['severidad', [fn('COUNT', col('id')), 'count']],
        where: whereTicket,
        group: ['severidad'],
        raw: true,
    });

    // normaliza a { label, count }
    const porEstado = porEstadoRaw.map((r) => ({
        label: r.estado || 'SIN_ESTADO',
        count: Number(r.count || 0),
    }));

    const porSeveridad = porSeveridadRaw.map((r) => ({
        label: r.severidad || 'SIN_SEVERIDAD',
        count: Number(r.count || 0),
    }));

    // ===== KPIs QA =====
    const horasQaTotal =
        (await TicketWorklog.sum('horas', { where: whereWl })) || 0;

    const devolucionesTotal = await TicketWorklog.count({
        where: { ...whereWl, tipo: 'DEVOLUCION' },
    });

    const topErrorTipoRaw = await TicketWorklog.findAll({
        attributes: ['errorTipo', [fn('COUNT', col('id')), 'count']],
        where: {
            ...whereWl,
            errorTipo: { [Op.ne]: null },
        },
        group: ['errorTipo'],
        order: [[literal('count'), 'DESC']],
        limit: 10,
        raw: true,
    });

    const topErrorTipo = topErrorTipoRaw.map((r) => ({
        errorTipo: r.errorTipo,
        count: Number(r.count || 0),
    }));

    // ===== KPIs PM =====
    const ticketsPorProyectoRaw = await Ticket.findAll({
        attributes: ['proyecto', [fn('COUNT', col('id')), 'count']],
        where: whereTicket,
        group: ['proyecto'],
        order: [[literal('count'), 'DESC']],
        raw: true,
    });

    const abiertosPorProyectoRaw = await Ticket.findAll({
        attributes: ['proyecto', [fn('COUNT', col('id')), 'count']],
        where: { ...whereTicket, estado: { [Op.ne]: 'CERRADO' } },
        group: ['proyecto'],
        order: [[literal('count'), 'DESC']],
        raw: true,
    });

    const ticketsPorProyecto = ticketsPorProyectoRaw.map((r) => ({
        proyecto: r.proyecto || 'SIN_PROYECTO',
        count: Number(r.count || 0),
    }));

    const abiertosPorProyecto = abiertosPorProyectoRaw.map((r) => ({
        proyecto: r.proyecto || 'SIN_PROYECTO',
        count: Number(r.count || 0),
    }));

    const payload = {
        month: m, // null si es global
        totals: {
            totalTickets,
            abiertos,
            cerrados,
        },
        porEstado,
        porSeveridad,

        qa: {
            horasQaTotal: Number(horasQaTotal),
            devolucionesTotal,
            topErrorTipo,
        },

        pm: {
            ticketsPorProyecto,
            abiertosPorProyecto,
        },
    };

    return filtrarPorRol(payload, rol);
};
