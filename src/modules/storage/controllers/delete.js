'use strict';

const policy = require('../storage_policy');
const winston = require('winston');

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
    const fileId = parseInt(req.params.fileId, 10);

    req.transaction.logger.debug('Checking policy');
    const authorized = await policy.filterDelete(req.transaction, fileId, req.session.auth);
    if (!authorized) {
        req.transaction.logger.info('Deletion refused by policy');
        throw res.boom.unauthorized();
    }

    req.transaction.logger.info('Destroying data', {fileId: fileId});
    await db.Data.destroy({where: {fileId: fileId}});

    req.transaction.logger.debug('Returning 204');
    return res.status(204).send();
};
