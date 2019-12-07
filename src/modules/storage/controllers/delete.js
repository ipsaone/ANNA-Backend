'use strict';

/**
 * @api {delete} /storage/:fileId Delete a file
 * @apiName delete
 * @apiGroup Storage
 */

const policy = require('../storage_policy');
const joi = require('joi');

const schema = joi.object().keys({});

module.exports = (db) => async (req, res) => {
    const fileId = parseInt(req.params.fileId, 10);

     // Validate user input
     req.transaction.logger.info('Validating schema');
     const validation = joi.validate(req.body, schema);
     if (validation.error) {
         req.transaction.logger.info('Schema validation failed');
         console.error(validation.error);
         return res.boom.badRequest(validation.error);
     }

    req.transaction.logger.debug('Checking policy');
    const authorized = await policy.filterDelete(req.transaction, fileId, req.session.auth);
    if (!authorized) {
        req.transaction.logger.info('Deletion refused by policy');
        throw res.boom.unauthorized();
    }

    req.transaction.logger.info('Destroying data', {fileId: fileId});
    await db.Data.destroy({where: {fileId: fileId}});

    // req.transaction.logger.info('Destroying file', {fileId: fileId});
    // await db.File.destroy({where: {id: fileId}});

    req.transaction.logger.debug('Returning 204');
    return res.status(204).send();
};
