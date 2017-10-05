'use strict';

const router = require('express').Router();
const auth_controller = require('../controllers/auth_controller');

router.post('/login', auth_controller.login);
router.get('/logout', auth_controller.logout);

module.exports = router;