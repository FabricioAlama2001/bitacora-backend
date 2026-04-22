// src/api/users/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { authMiddleware } = require('../../auth/auth.middleware');

// General
router.get('/', userController.listUsers);
router.post('/register', userController.registerUser);

// Profile
router.get('/me', authMiddleware, userController.getMyProfile);
router.put('/me', authMiddleware, userController.updateMyProfile);
router.put('/me/password', authMiddleware, userController.changeMyPassword);

module.exports = router;