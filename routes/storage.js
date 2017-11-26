'use strict';

const router = require('express').Router();
const storageController = require('../controllers/storage_controller');

const multer = require('multer');
const config = require('../config/config');
const upload = multer({dest: config.storage.temp});

// Upload a file or edit it (use ?revision=:id)
router.post('/upload', upload.single('contents'), storageController.upload_new);
router.put('/upload/:fileId', upload.single('contents'), storageController.upload_rev);

// List files in a folder
router.get('/files/list/:folderId', storageController.list);

// Download file data or contents (use ?rev=:revId for a special revision, ?download=true for contents)
router.get('/files/:fileId', storageController.download);

router.delete('/files/:fileId', storageController.delete);

module.exports = router;
