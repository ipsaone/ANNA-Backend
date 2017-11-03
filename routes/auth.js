'use strict';

const router = require('express').Router();
const auth_controller = require('../controllers/auth_controller');

router.post('/login', auth_controller.login);
router.get('/logout', auth_controller.logout);
router.get('/check', auth_controller.check);

module.exports = router;