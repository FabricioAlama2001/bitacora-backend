// src/core/kpis/kpis.service.js
const { Ticket, TicketWorklog } = require('../../models');
const { Op, fn, col, literal } = require('sequelize');

// ===== internal codes for business logic =====
const CLOSED_STATUS = 'CLOSED';
const RETURN_TYPE = 'RETURN';

// ===== month helpers =====
function normalizeMonth(monthStr) {
    if (!monthStr) return null;
    return String(monthStr).trim();
}

function getMonthRange(monthStr) {
    const [yearStr, monthOnlyStr] = monthStr.split('-');
    const year = Number(yearStr);
    const monthIndex = Number(monthOnlyStr) - 1;

    if (!year || monthIndex < 0 || monthIndex > 11) {
        const error = new Error('month inválido, usa formato YYYY-MM');
        error.status = 400;
        throw error;
    }

    const start = new Date(year, monthIndex, 1, 0, 0, 0);
    const endExclusive = new Date(year, monthIndex + 1, 1, 0, 0, 0);

    // for DATEONLY fields
    const startStr = start.toISOString().slice(0, 10);
    const endLastDay = new Date(year, monthIndex + 1, 0, 0, 0, 0);
    const endStr = endLastDay.toISOString().slice(0, 10);

    return { start, endExclusive, startStr, endStr };
}

// ===== role filter =====
function filterByRole(payload, role) {
    const basePayload = {
        month: payload.month,
        totals: payload.totals,
        ticketsByStatus: payload.ticketsByStatus,
        ticketsBySeverity: payload.ticketsBySeverity,
    };

    if (role === 'QA') {
        return {
            ...basePayload,
            qa: payload.qa,
        };
    }

    if (role === 'PM') {
        return {
            ...basePayload,
            pm: payload.pm,
        };
    }

    return payload;
}

// ===== main service =====
exports.getKpis = async ({ month, user }) => {
    const role = user?.role || 'QA';
    const normalizedMonth = normalizeMonth(month);

    const ticketWhere = {};
    const worklogWhere = {};

    if (normalizedMonth) {
        const { start, endExclusive, startStr, endStr } = getMonthRange(normalizedMonth);

        // tickets filtered by qaReportDate
        ticketWhere.qaReportDate = { [Op.gte]: start, [Op.lt]: endExclusive };

        // worklogs filtered by date (DATEONLY)
        worklogWhere.date = { [Op.between]: [startStr, endStr] };
    }

    // ===== common KPIs =====
    const totalTickets = await Ticket.count({ where: ticketWhere });

    const closedTickets = await Ticket.count({
        where: { ...ticketWhere, status: CLOSED_STATUS },
    });

    const openTickets = await Ticket.count({
        where: { ...ticketWhere, status: { [Op.ne]: CLOSED_STATUS } },
    });

    const ticketsByStatusRaw = await Ticket.findAll({
        attributes: ['status', [fn('COUNT', col('id')), 'count']],
        where: ticketWhere,
        group: ['status'],
        raw: true,
    });

    const ticketsBySeverityRaw = await Ticket.findAll({
        attributes: ['severity', [fn('COUNT', col('id')), 'count']],
        where: ticketWhere,
        group: ['severity'],
        raw: true,
    });

    const ticketsByStatus = ticketsByStatusRaw.map((row) => ({
        label: row.status || 'SIN_ESTADO',
        count: Number(row.count || 0),
    }));

    const ticketsBySeverity = ticketsBySeverityRaw.map((row) => ({
        label: row.severity || 'SIN_SEVERIDAD',
        count: Number(row.count || 0),
    }));

    // ===== QA KPIs =====
    const totalQaHours =
        (await TicketWorklog.sum('hours', { where: worklogWhere })) || 0;

    const totalReturns = await TicketWorklog.count({
        where: { ...worklogWhere, type: RETURN_TYPE },
    });

    const topErrorTypesRaw = await TicketWorklog.findAll({
        attributes: ['errorType', [fn('COUNT', col('id')), 'count']],
        where: {
            ...worklogWhere,
            errorType: { [Op.ne]: null },
        },
        group: ['errorType'],
        order: [[literal('count'), 'DESC']],
        limit: 10,
        raw: true,
    });

    const topErrorTypes = topErrorTypesRaw.map((row) => ({
        errorType: row.errorType,
        count: Number(row.count || 0),
    }));

    // ===== PM KPIs =====
    const ticketsByProjectRaw = await Ticket.findAll({
        attributes: ['project', [fn('COUNT', col('id')), 'count']],
        where: ticketWhere,
        group: ['project'],
        order: [[literal('count'), 'DESC']],
        raw: true,
    });

    const openTicketsByProjectRaw = await Ticket.findAll({
        attributes: ['project', [fn('COUNT', col('id')), 'count']],
        where: {
            ...ticketWhere,
            status: { [Op.ne]: CLOSED_STATUS },
        },
        group: ['project'],
        order: [[literal('count'), 'DESC']],
        raw: true,
    });

    const ticketsByProject = ticketsByProjectRaw.map((row) => ({
        project: row.project || 'SIN_PROYECTO',
        count: Number(row.count || 0),
    }));

    const openTicketsByProject = openTicketsByProjectRaw.map((row) => ({
        project: row.project || 'SIN_PROYECTO',
        count: Number(row.count || 0),
    }));

    const payload = {
        month: normalizedMonth,
        totals: {
            totalTickets,
            openTickets,
            closedTickets,
        },
        ticketsByStatus,
        ticketsBySeverity,
        qa: {
            totalQaHours: Number(totalQaHours),
            totalReturns,
            topErrorTypes,
        },
        pm: {
            ticketsByProject,
            openTicketsByProject,
        },
    };

    return filterByRole(payload, role);
};