'use strict';

const router = require('express').Router();
const storage_controller = require('../controllers/storage_controller');
const config = require('../config/config').storage;
const multer = require('multer');

const upload = multer({dest: 'tmp/'});

router.get('/*', storage_controller.index);

// Uploading
router.post('/', storage_controller.store);
router.put('/*', upload.single('file'), storage_controller.put);

module.exports = router;