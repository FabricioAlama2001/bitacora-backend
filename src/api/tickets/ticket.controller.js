// src/api/tickets/ticket.controller.js
const ticketService = require('../../core/ticket/ticket.service');

const listTickets = async (req, res, next) => {
    try {
        const tickets = await ticketService.listTicketsByMonth();
        res.json(tickets);
    } catch (error) {
        next(error);
    }
};

const getTicketById = async (req, res, next) => {
    try {
        const ticket = await ticketService.getTicketById(req.params.id);
        res.json(ticket);
    } catch (error) {
        next(error);
    }
};

const createTicket = async (req, res, next) => {
    try {
        const user = req.user || null;
        const ticket = await ticketService.createTicket(req.body, user);
        res.status(201).json(ticket);
    } catch (error) {
        next(error);
    }
};

const updateTicket = async (req, res, next) => {
    try {
        const user = req.user || null;
        const ticket = await ticketService.updateTicket(req.params.id, req.body, user);
        res.json(ticket);
    } catch (error) {
        next(error);
    }
};

const deleteTicket = async (req, res, next) => {
    try {
        const role = req.user?.role;

        if (role !== 'ADMIN') {
            return res.status(403).json({ message: 'No autorizado' });
        }

        const result = await ticketService.deleteTicket(req.params.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

const listWorklogs = async (req, res, next) => {
    try {
        const data = await ticketService.listWorklogs(req.params.id);
        res.json(data);
    } catch (error) {
        next(error);
    }
};

const addWorklog = async (req, res, next) => {
    try {
        const role = req.user?.role;

        if (!['QA', 'ADMIN'].includes(role)) {
            return res.status(403).json({ message: 'No autorizado' });
        }

        const data = await ticketService.addWorklog(req.params.id, req.body, req.user);
        res.status(201).json(data);
    } catch (error) {
        next(error);
    }
};

const deleteWorklog = async (req, res, next) => {
    try {
        const data = await ticketService.deleteWorklog(req.params.id, req.params.worklogId);
        res.json(data);
    } catch (error) {
        next(error);
    }
};

const listClosedTickets = async (req, res, next) => {
    try {
        const { page, limit, month, q } = req.query;

        const data = await ticketService.listClosedTickets({
            page,
            limit,
            month,
            q,
        });

        res.json(data);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listTickets,
    getTicketById,
    createTicket,
    updateTicket,
    deleteTicket,
    listWorklogs,
    addWorklog,
    deleteWorklog,
    listClosedTickets,
};