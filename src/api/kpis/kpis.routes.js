const express = require('express');
const router = express.Router();

const kpisController = require('./kpis.controller');
const { authMiddleware } = require('../../auth/auth.middleware');


router.use(authMiddleware);

router.get('/', kpisController.getKpis);

module.exports = router;
