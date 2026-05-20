const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/rolMiddleware');

router.get('/', verifyToken, checkRole('usuarios'), userController.getUsers);
router.post('/', verifyToken, checkRole('usuarios'), userController.createUser);
router.put('/:id', verifyToken, checkRole('usuarios'), userController.updateUser);
router.delete('/:id', verifyToken, checkRole('usuarios'), userController.deleteUser);

module.exports = router;