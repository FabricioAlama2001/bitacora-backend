const express = require('express');
const router = express.Router();
const ticketController = require('./ticket.controller');
const { authMiddleware } = require('../../auth/auth.middleware');
const { requireRole } = require('../../auth/role.middleware');

// All ticket routes require authentication
router.use(authMiddleware);

// List tickets (current month)
router.get('/', ticketController.listTickets);

// Closed tickets history (important: before /:id)
router.get('/closed', ticketController.listClosedTickets);

// Get ticket by id (after /closed)
router.get('/:id', ticketController.getTicketById);

// Worklogs
router.get('/:id/worklogs', ticketController.listWorklogs);
router.post('/:id/worklogs', requireRole('QA', 'ADMIN'), ticketController.addWorklog);
router.delete('/:id/worklogs/:worklogId', requireRole('ADMIN'), ticketController.deleteWorklog);

// CRUD
router.post('/', requireRole('PM', 'ADMIN'), ticketController.createTicket);
router.put('/:id', requireRole('PM', 'QA', 'ADMIN'), ticketController.updateTicket);
router.delete('/:id', requireRole('ADMIN'), ticketController.deleteTicket);

module.exports = router;