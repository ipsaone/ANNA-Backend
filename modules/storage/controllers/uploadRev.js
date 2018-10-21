'use strict';

const policy = require('../storage_policy');

/**
 *
 * Upload a new revision for an existing file.
 *
 * @param {obj} req     - The user request.
 * @param {obj} res     - The response to be sent.
 * @todo for security, better escape req.body, like validating against a schema ?
 * @todo handle file contents upload !
 *
 * @returns {obj} Promise.
 *
 */

module.exports = (db) => async (req, res) => {
    if (isNaN(parseInt(req.params.fileId, 10))) {
        throw res.boom.badRequest();
    }
    const fileId = parseInt(req.params.fileId, 10);

    // Escape req.body strings
    Object.keys(req.body).map(function (key) {
        if (typeof req.body[key] === 'string') {
            req.body[key] = escape(req.body[key]);
        }

        return true;
    });

    // Find the file in database and add new data
    const allowed = await policy.filterUploadRev(db, fileId, req.session.auth);

    if (!allowed) {
        throw res.boom.unauthorized();
    }

    const file = await db.File.findByPk(fileId);
    let filePath = '';
    if (req.file) {
        filePath = req.file.path;
    }

    let data = await file.addData(db, req.body, filePath, req.session.auth);

    return res.status(200).json(data);
};
