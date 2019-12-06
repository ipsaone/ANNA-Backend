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
    router.put('/:fileId([0-9]+)', upload.single('contents'), storageController.uploadRev);
    router.post('/', upload.single('contents'), storageController.uploadNew);

    // Search for files
    router.post('/search', storageController.search);

    // Download file data or contents (use ?rev=:revId for a special revision, ?download=true for contents)
    router.get('/:fileId([0-9]+)', storageController.download);
    router.get('/:fileId([0-9]+)/meta', storageController.getMeta);
    router.get('/:folderId([0-9]+/list)', storageController.list);

    router.delete('/:fileId([0-9]+)', storageController.delete);

    return router;
};
