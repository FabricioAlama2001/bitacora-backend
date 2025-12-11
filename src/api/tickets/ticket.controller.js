// src/api/tickets/ticket.controller.js
const ticketService = require('../../core/ticket/ticket.service');

const listar = async (req, res, next) => {
    try {
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
        const user = req.user || null; // luego vendrá de auth
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
        const result = await ticketService.deleteTicket(req.params.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

// 👈 AQUÍ está la clave: exportar todas las funciones correctamente
module.exports = {
    listar,
    obtenerPorId,
    crear,
    actualizar,
    eliminar,
};
