const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const verifyToken = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/rolMiddleware');

router.get('/', verifyToken, checkRole('menu'), menuController.getMenu);
router.post('/', verifyToken, checkRole('menu'), menuController.createMenu);
router.put('/:id', verifyToken, checkRole('menu'), menuController.updateMenu);
router.delete('/:id', verifyToken, checkRole('menu'), menuController.deleteMenu);

module.exports = router;