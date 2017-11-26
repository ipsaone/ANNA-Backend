'use strict';

const router = require('express').Router();
const authController = require('../controllers/auth_controller');

router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/check', authController.check);

module.exports = router;
