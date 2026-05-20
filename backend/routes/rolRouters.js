const express = require('express');
const router = express.Router();
const roleController = require('../controllers/rolController');
const verifyToken = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/rolMiddleware');

router.get('/', verifyToken, checkRole('roles'), roleController.getRoles);
router.post('/', verifyToken, checkRole('roles'), roleController.createRoles);
router.put('/:id', verifyToken, checkRole('roles'), roleController.updateRoles);
router.delete('/:id', verifyToken, checkRole('roles'), roleController.deleteRoles);

module.exports = router;