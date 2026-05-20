const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
const verifyToken = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/rolMiddleware');

router.get('/', verifyToken, checkRole('categorias'), categoriaController.getCategorias);
router.post('/', verifyToken, checkRole('categorias'), categoriaController.createCategoria);
router.put('/:id', verifyToken, checkRole('categorias'), categoriaController.updateCategoria);
router.delete('/:id', verifyToken, checkRole('categorias'), categoriaController.deleteCategoria);    

module.exports = router;