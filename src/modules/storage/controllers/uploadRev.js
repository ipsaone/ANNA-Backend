'use strict';

const policy = require('../storage_policy');
const winston = require('winston');

/**
 *
 * Upload a new revision for an existing file.
 *
 * @param {obj} req     - The user request.
 * @param {obj} res     - The response to be sent.
 * 
 * @todo for security, better escape req.body, like validating against a schema ?
 * @todo handle file contents upload !
 *
 * @returns {obj} Promise.
 *
 */

module.exports = (db) => async (req, res) => {
    const fileId = parseInt(req.params.fileId, 10);

    // Escape req.body strings
    winston.info('Escaping res.body strings');
    Object.keys(req.body).map(function (key) {
        if (typeof req.body[key] === 'string') {
            req.body[key] = escape(req.body[key]);
        }

        return true;
    });

    // Find the file in database and add new data
    winston.debug('Checking policies')
    const allowed = await policy.filterUploadRev(db, fileId, req.session.auth);
    if (!allowed) {
        winston.info('Upload (rev) refused by policies');
        throw res.boom.unauthorized();
    }

    winston.debug('Finding file and reading path')
    const file = await db.File.findByPk(fileId);
    let filePath = '';
    if (req.file) {
        filePath = req.file.path;
    }


    try {
        winston.debug('adding data');
        let data = await file.addData(db, req.body, filePath, req.session.auth);

        winston.info('Responding with new data');
        return res.status(200).json(data);
    } catch (e) {
        return res.boom.badRequest(e);
    }

    
};
