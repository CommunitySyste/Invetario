const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const verifyToken = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/rolMiddleware');

router.get('/', verifyToken, checkRole('stocks'), stockController.getEstadisticasStock);

module.exports = router;