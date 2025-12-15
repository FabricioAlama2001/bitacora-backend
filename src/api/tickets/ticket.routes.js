const express = require('express');
const router = express.Router();
const ticketController = require('./ticket.controller');
const { authMiddleware } = require('../../auth/auth.middleware');
const { requireRole } = require('../../auth/role.middleware');

// Todas las rutas de tickets requieren estar logueado
router.use(authMiddleware);

router.get('/', ticketController.listar);
router.get('/:id', ticketController.obtenerPorId);

// Solo QA puede crear y actualizar (ejemplo)
router.post('/', requireRole('QA'), ticketController.crear);
router.put('/:id', requireRole('QA'), ticketController.actualizar);

// Tal vez solo ADMIN podría borrar, pero por ahora QA
router.delete('/:id', requireRole('QA'), ticketController.eliminar);

// ver historial: cualquiera logueado (PM/QA/ADMIN)
router.get('/:id/worklogs', ticketController.listWorklogs);

// agregar horas: solo QA y ADMIN
router.post('/:id/worklogs', requireRole('QA', 'ADMIN'), ticketController.addWorklog);

// borrar worklog: solo ADMIN (por seguridad)
router.delete('/:id/worklogs/:worklogId', requireRole('ADMIN'), ticketController.deleteWorklog);


module.exports = router;
