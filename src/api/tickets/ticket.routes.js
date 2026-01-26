const express = require('express');
const router = express.Router();
const ticketController = require('./ticket.controller');
const { authMiddleware } = require('../../auth/auth.middleware');
const { requireRole } = require('../../auth/role.middleware');

// Todas las rutas de tickets requieren estar logueado
router.use(authMiddleware);

// ✅ listar tickets (por mes actual)
router.get('/', ticketController.listar);

// ✅ historial de CERRADOS (IMPORTANTE: antes de /:id)
router.get('/cerrados', ticketController.listarCerrados);

// ✅ obtener por id (después de /cerrados)
router.get('/:id', ticketController.obtenerPorId);

// Worklogs
router.get('/:id/worklogs', ticketController.listWorklogs);
router.post('/:id/worklogs', requireRole('QA', 'ADMIN'), ticketController.addWorklog);
router.delete('/:id/worklogs/:worklogId', requireRole('ADMIN'), ticketController.deleteWorklog);

// CRUD
router.post('/', requireRole('PM', 'ADMIN'), ticketController.crear);
router.put('/:id', requireRole('PM', 'QA', 'ADMIN'), ticketController.actualizar);
router.delete('/:id', requireRole('ADMIN'), ticketController.eliminar);

module.exports = router;
