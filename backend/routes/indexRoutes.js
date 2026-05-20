const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');
const verifyToken = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/rolMiddleware');

router.get('/', verifyToken, checkRole('index'), indexController.getDashboard);

module.exports = router;