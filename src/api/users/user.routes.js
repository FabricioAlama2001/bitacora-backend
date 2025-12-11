// src/api/users/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
// Más adelante puedes proteger con ADMIN si quieres
// const { authMiddleware } = require('../../auth/auth.middleware');
// const { requireRole } = require('../../auth/role.middleware');

router.get('/', userController.listar);
router.post('/register', userController.registrar);

module.exports = router;
