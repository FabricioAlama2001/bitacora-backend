// src/api/tickets/ticket.controller.js
const ticketService = require('../../core/ticket/ticket.service');

exports.listar = async (req, res, next) => {
    try {
        const month = req.query.month; // 'YYYY-MM' o vacío
        const tickets = await ticketService.listTicketsByMonth(month);
        res.json(tickets);
    } catch (error) {
        next(error);
    }
};

exports.obtenerPorId = async (req, res, next) => {
    try {
        const ticket = await ticketService.getTicketById(req.params.id);
        res.json(ticket);
    } catch (error) {
        next(error);
    }
};

exports.crear = async (req, res, next) => {
    try {
        const user = req.user || null;
        const ticket = await ticketService.createTicket(req.body, user);
        res.status(201).json(ticket);
    } catch (error) {
        next(error);
    }
};

exports.actualizar = async (req, res, next) => {
    try {
        const user = req.user || null;
        const ticket = await ticketService.updateTicket(
            req.params.id,
            req.body,
            user
        );
        res.json(ticket);
    } catch (error) {
        next(error);
    }
};

exports.eliminar = async (req, res, next) => {
    try {
        const result = await ticketService.deleteTicket(req.params.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};
