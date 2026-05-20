const express = require('express');
const router = express.Router();
const comprasController = require('../controllers/comprasController');
const verifyToken = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/rolMiddleware');

router.post('/', verifyToken, checkRole('compras'), comprasController.createCompra);
router.get('/', verifyToken, checkRole('compras'), comprasController.getCompra);
router.get('/:id', verifyToken, checkRole('compras'), comprasController.getDetalleCompra);
router.delete('/:id', verifyToken, checkRole('compras'), comprasController.deleteCompra);
router.put('/:id', verifyToken, checkRole('compras'), comprasController.updateCompra);
router.get('/pdf/:id', verifyToken, checkRole('compras'), comprasController.getPdfCompras);

module.exports = router;