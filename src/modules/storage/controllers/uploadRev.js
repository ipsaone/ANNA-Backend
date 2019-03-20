'use strict';

const policy = require('../storage_policy');
const winston = require('winston');

module.exports = (db) => async (req, res) => {
    const fileId = parseInt(req.params.fileId, 10);

    // Escape req.body strings
    req.transaction.logger.info('Escaping res.body strings');
    Object.keys(req.body).map(function (key) {
        if (typeof req.body[key] === 'string') {
            req.body[key] = escape(req.body[key]);
        }

        return true;
    });

    // Find the file in database and add new data
    req.transaction.logger.debug('Checking policies')
    const allowed = await policy.filterUploadRev(req.transaction, fileId, req.session.auth);
    if (!allowed) {
        req.transaction.logger.info('Upload (rev) refused by policies');
        throw res.boom.unauthorized();
    }

    req.transaction.logger.debug('Finding file and reading path')
    const file = await db.File.findByPk(fileId);
    let filePath = '';
    if (req.file) {
        req.transaction.logger.debug('Reading file path');
        filePath = req.file.path;
    }

    req.transaction.logger.debug('adding data');
    let data = await file.addData(db, req.body, filePath, req.session.auth);

    req.transaction.logger.info('Responding with new data');
    return res.status(200).json(data);


};
