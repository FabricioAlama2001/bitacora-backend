// src/api/tickets/ticket.controller.js
const ticketService = require('../../core/ticket/ticket.service');

const listar = async (req, res, next) => {
    try {
        // Si sigues usando el listado por mes, cámbialo aquí:
        // const month = req.query.month;
        // const tickets = await ticketService.listTicketsByMonth(month);

        const tickets = await ticketService.listTickets();
        res.json(tickets);
    } catch (error) {
        next(error);
    }
};

const obtenerPorId = async (req, res, next) => {
    try {
        const ticket = await ticketService.getTicketById(req.params.id);
        res.json(ticket);
    } catch (error) {
        next(error);
    }
};

const crear = async (req, res, next) => {
    try {
        const user = req.user || null;
        const ticket = await ticketService.createTicket(req.body, user);
        res.status(201).json(ticket);
    } catch (error) {
        next(error);
    }
};

const actualizar = async (req, res, next) => {
    try {
        const user = req.user || null;
        const ticket = await ticketService.updateTicket(req.params.id, req.body, user);
        res.json(ticket);
    } catch (error) {
        next(error);
    }
};

const eliminar = async (req, res, next) => {
    try {
        const rol = req.user?.rol;
        if (rol !== 'ADMIN') return res.status(403).json({ message: 'No autorizado' });

        const result = await ticketService.deleteTicket(req.params.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

// =========================
// Worklogs (Historial horas)
// =========================

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
        const rol = req.user?.rol;
        if (!['QA','ADMIN'].includes(rol)) return res.status(403).json({ message: 'No autorizado' });

        const data = await ticketService.addWorklog(req.params.id, req.body, req.user);
        res.status(201).json(data);
    } catch (e) { next(e); }
};

const deleteWorklog = async (req, res, next) => {
    try {
        const data = await ticketService.deleteWorklog(req.params.id, req.params.worklogId);
        res.json(data);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listar,
    obtenerPorId,
    crear,
    actualizar,
    eliminar,
    listWorklogs,
    addWorklog,
    deleteWorklog,
};
