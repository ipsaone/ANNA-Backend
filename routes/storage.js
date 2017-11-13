'use strict';

const router = require('express').Router();
const storage_controller = require('../controllers/storage_controller');

const multer = require('multer');
const config = require('../config/config');
let upload = multer({dest: config.storage.temp});

// Upload a file or edit it (use ?revision=:id)
router.post('/upload', upload.single('contents'), storage_controller.upload_new);
router.put('/upload/:fileId', upload.single('contents'), storage_controller.upload_rev);

// List files in a folder
router.get('/files/list/:folderId', storage_controller.list);

// Download file data or contents (use ?rev=:revId for a special revision, ?download=true for contents)
router.get('/files/:fileId', storage_controller.download);

module.exports = router;