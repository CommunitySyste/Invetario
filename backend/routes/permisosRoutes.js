const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const permisosController = require('../controllers/permisosController');
const checkRole = require('../middlewares/rolMiddleware');

router.get('/disponibles/:rol_id', verifyToken, checkRole('permiso'), permisosController.getSubmenusDisponibles);
router.get('/:rol_id', verifyToken, checkRole('permiso'), permisosController.getPermisosByRol);
router.post('/asignar', verifyToken, checkRole('permiso'), permisosController.asignarPermisos);
router.put('/:id', verifyToken, checkRole('permiso'), permisosController.updatePermiso);
router.delete('/:id', verifyToken, checkRole('permiso'), permisosController.deletePermiso);

module.exports = router;