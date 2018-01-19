'use strict';

const db = require.main.require('./models');
const policy = require.main.require('./policies/storage_policy');

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

module.exports = async (req, res) => {
    if (isNaN(parseInt(req.params.fileId, 10))) {
        throw res.boom.badRequest();
    }
    const fileId = parseInt(req.params.fileId, 10);

    const authorized = policy.filterDelete();

    if (!authorized) {
        throw res.boom.unauthorized();
    }

    await db.Data.destroy({where: {}});
    await db.File.destroy({where: {id: fileId}});

    return res.status(204).send();
};
