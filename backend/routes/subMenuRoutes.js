const express = require('express');
const router = express.Router();
const subMenuController = require('../controllers/subMenuController');
const verifyToken = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/rolMiddleware');

router.get('/menu/:id', verifyToken, checkRole('menu'), subMenuController.getSubmenusByMenu);
router.post('/', verifyToken, checkRole(), subMenuController.createSubmenu);
router.put('/menu/:id', verifyToken, checkRole(), subMenuController.updateSubmenu);
router.delete('/:id', verifyToken, checkRole(), subMenuController.deleteSubmenu);

module.exports = router;