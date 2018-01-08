/* eslint new-cap: 0 */

'use strict';

const router = require('express').Router();
const authController = require('../controllers/auth');

router.post('/login', authController.login);
router.get('/logout', authController.logout);

module.exports = router;
