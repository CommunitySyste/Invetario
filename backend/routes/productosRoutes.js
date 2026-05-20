const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');
const verifyToken = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/rolMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/proveedor/:proveedor_id', verifyToken, checkRole('productos'), productosController.getProductoByProveedor);
router.get('/', verifyToken, checkRole('productos'), productosController.getProductos);
router.get('/stats', verifyToken, checkRole('productos'), productosController.getStatsProductos);
router.post('/', verifyToken, checkRole('productos'), upload.single('imagen'), productosController.createProducto);
router.put('/:id', verifyToken, checkRole('productos'), upload.single('imagen'), productosController.updateProducto);
router.delete('/:id', verifyToken, checkRole('productos'), productosController.deleteProducto);
router.get('/pdf', verifyToken, checkRole('productos'), productosController.generarPDFProductos);
router.get('/pdf/:id', verifyToken, checkRole('productos'), productosController.generarPDFProductosIndividual);

module.exports = router;