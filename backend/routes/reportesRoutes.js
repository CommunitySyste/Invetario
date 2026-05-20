const express = require('express');
const router = express.Router();
const reportesProductosController = require('../controllers/reportesProductosController');
const verifyToken = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/rolMiddleware');

router.get('/productos', verifyToken, checkRole('repproductos'), reportesProductosController.getProductos);
router.get('/productos/categoria', verifyToken, checkRole('repproductos'), reportesProductosController.getByCategoria);
router.get('/productos/mes', verifyToken, checkRole('repproductos'), reportesProductosController.getByMes);
router.get('/productos/stock', verifyToken, checkRole('repproductos'), reportesProductosController.getStock);
router.get('/productos/stock_bajo', verifyToken, checkRole('repproductos'), reportesProductosController.getStockBajo);

module.exports = router;