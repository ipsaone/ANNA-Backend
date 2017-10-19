'use strict';

const router = require('express').Router();
const storage_controller = require('../controllers/storage_controller');
const multer = require('multer');

const upload = multer({dest: '/tmp/'});

router.get('/files/:fileId', storage_controller.show);

module.exports = router;