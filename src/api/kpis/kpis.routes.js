const express = require('express');
const router = express.Router();

const kpisController = require('./kpis.controller');
const { authMiddleware } = require('../../auth/auth.middleware');

// todo KPI requiere login
router.use(authMiddleware);

// GET /api/kpis?month=YYYY-MM (opcional)
router.get('/', kpisController.getKpis);

module.exports = router;
