'use strict';

const policy = require('../storage_policy');
const winston = require('winston');

/**
 *
 * Upload a new file.
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 */

module.exports = (db) => async (req, res) => {

    /*
     * ATTENTION : NO INPUT VALIDATION !
     * (Integer checking for dirId/groupId)
     */

    // Escape req.body strings
    winston.info('Escaping req.body strings')
    Object.keys(req.body).map((key) => {
        if (typeof req.body[key] === 'string') {
            req.body[key] = encodeURI(req.body[key]);
        }

        return true;
    });

    // Check folderId
    const dirId = parseInt(req.body.dirId, 10);

    // Create the file and its data
    winston.debug('Checking (new) upload policies');
    const allowed = await policy.filterUploadNew(db, dirId, req.session.auth);
    if (!allowed) {
        winston.info('Upload (new) refused by policies');
        throw res.boom.unauthorized();
    }

    let filePath = '';
    if (req.file) {
        winston.debug('Reading file path');
        filePath = req.file.path;
    }

    winston.info('Creating file')
    const data = await db.File.createNew(db, req.body, filePath, req.session.auth);

    winston.info('Sending created data');
    return res.status(200).json(data);
};
