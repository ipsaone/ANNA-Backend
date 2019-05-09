/* eslint new-cap: 0*/

'use strict';

module.exports = (db) => {

    const router = require('express').Router();
    const storageController = require('./controllers')(db);

    const multer = require('multer');
    const findRoot = require('find-root');
    const root = findRoot(__dirname);
    const path = require('path');
    const config = require(path.join(root, 'src', './config/config'));
    const upload = multer({dest: config.storage.temp});

    // Upload a file or edit it (use ?revision=:id)
    router.put('/upload/:fileId([0-9]+)', upload.single('contents'), storageController.uploadRev);
    router.post('/upload', upload.single('contents'), storageController.uploadNew);

    // List files in a folder
    router.get('/files/list/:folderId([0-9]+)', storageController.list);

    // Search for files
    router.post('/files/search', storageController.search);

    // Download file data or contents (use ?rev=:revId for a special revision, ?download=true for contents)
    router.get('/files/:fileId([0-9]+)', storageController.download);

    router.delete('/files/:fileId([0-9]+)', storageController.delete);

    return router;
};
