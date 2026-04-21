// src/api/users/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('./user.controller');

// Later you can protect these routes with ADMIN if needed
// const { authMiddleware } = require('../../auth/auth.middleware');
// const { requireRole } = require('../../auth/role.middleware');

router.get('/', userController.listUsers);
router.post('/register', userController.registerUser);

module.exports = router;