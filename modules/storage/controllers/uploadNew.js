'use strict';

const db = require.main.require('./modules');
const policy = require('../storage_policy');

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

module.exports = async (req, res) => {

    /*
     * ATTENTION : NO INPUT VALIDATION !
     * (Integer checking for dirId/groupId)
     */

    // Escape req.body strings
    Object.keys(req.body).map((key) => {
        if (typeof req.body[key] === 'string') {
            req.body[key] = encodeURI(req.body[key]);
        }

        return true;
    });

    // Create the file and its data
    const allowed = await policy.filterUploadNew(req.body.dirId, req.session.auth);

    if (!allowed) {
        throw res.boom.unauthorized();
    }

    let filePath = '';

    if (req.file) {
        filePath = req.file.path;
    }

    const data = await db.File.createNew(req.body, filePath, req.session.auth);

    return res.status(204).json(data);
};
