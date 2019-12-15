'use strict';

const policy = require('../storage_policy');
const fs = require('fs');
const util = require('util');
const joi = require('@hapi/joi');
const findRoot = require('find-root');
const root = findRoot(__dirname);

const schema = joi.object().keys({});

module.exports = (db) => async (req, res) => {
    const fileId = parseInt(req.params.fileId, 10);

     // Validate user input
     req.transaction.logger.info('Validating schema');
     const validation = schema.validate(req.body);
     if (validation.error) {
         req.transaction.logger.info('Schema validation failed');
         return res.boom.badRequest(validation.error);
     }

    

    req.transaction.logger.info('Starting metadata download routine');

    req.transaction.logger.debug('Checking policy')
    const allowed = await policy.filterDownloadMeta(req.transaction, fileId, req.session.auth);
    if (!allowed) {
        req.transaction.logger.info('Metadata download refused by policy');
        throw res.boom.unauthorized();
    }

    req.transaction.logger.debug('Requesting corresponding data');
    const data = await db.Data.findAll({
        where: {fileId},
        include: ['rights']
    });

    req.transaction.logger.info('Sending metadata', {data: data.map(e => e.toJSON())})
    return res.status(200).json(data);
};
