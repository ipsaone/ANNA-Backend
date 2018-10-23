'use strict';

const policy = require('../storage_policy');

/**
 *
 * Deletes a file or folder.
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 */

module.exports = (db) => async (req, res) => {
    if (isNaN(parseInt(req.params.fileId, 10))) {
        throw res.boom.badRequest();
    }
    const fileId = parseInt(req.params.fileId, 10);

    const authorized = await policy.filterDelete(db, fileId, req.session.auth);
    if (!authorized) {
        throw res.boom.unauthorized();
    }

    await db.Data.destroy({where: {fileId: fileId}});

    return res.status(204).send();
};
