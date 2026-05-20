const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');
const verifyToken = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/rolMiddleware');

router.post('/', verifyToken, checkRole('ventas'), ventasController.createVenta);
router.get('/', verifyToken, checkRole('ventas'), ventasController.getVenta);
router.get('/:id', verifyToken, checkRole('ventas'), ventasController.getDetalleVenta);
router.delete('/:id', verifyToken, checkRole('ventas'), ventasController.deleteVenta);
router.put('/:id', verifyToken, checkRole('ventas'), ventasController.updateVenta);
router.get('/pdf/:id', verifyToken, checkRole('ventas'), ventasController.getPdfVentas);

module.exports = router;