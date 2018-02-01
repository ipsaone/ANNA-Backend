'use strict';

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');
const db = require(path.join(root, './modules'));
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

module.exports = async (req, res) => {
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
    const allowed = await policy.filterUploadRev();

    if (!allowed) {
        throw res.boom.unauthorized();
    }

    const file = await db.File.findById(fileId);

    await file.addData(req.body, req.file.path);

    return res.status(200).json({});
};
