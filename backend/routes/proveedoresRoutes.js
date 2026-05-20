const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');
const verifyToken = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/rolMiddleware');

router.get('/', verifyToken, checkRole('proveedores'), proveedorController.getProveedores);
router.post('/', verifyToken, checkRole('proveedores'), proveedorController.createProveedor);
router.put('/:id', verifyToken, checkRole('proveedores'), proveedorController.updateProveedor);
router.delete('/:id', verifyToken, checkRole('proveedores'), proveedorController.deleteProveedor);

module.exports = router;