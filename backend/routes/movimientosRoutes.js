const express = require('express');
const router = express.Router();
const movimientosController = require('../controllers/movimientosController');
const verifyToken = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/rolMiddleware');

router.post('/', verifyToken, checkRole('movimientos'), movimientosController.createMovimiento);
router.get('/', verifyToken, checkRole('movimientos'), movimientosController.getMovimientos);
router.get('/estadisticas', verifyToken, checkRole('movimientos'), movimientosController.getEstadisticasMovimientos);
router.get('/pdf/:id', verifyToken, checkRole('movimientos'), movimientosController.getPdfMovimientos);

module.exports = router;