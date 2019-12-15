'use strict';

const policy = require('../user_policy');

const joi = require('@hapi/joi');
const schema = joi.object().keys({});

module.exports = (db) => async function (req, res) {
    
    // Validate user input
    req.transaction.logger.info('Validating schema');
    const validation = schema.validate(req.body);
    if (validation.error) {
        req.transaction.logger.info('Schema validation failed');
        return res.boom.badRequest(validation.error);
    }
    
    req.transaction.logger.info('Finding all users');
    const users = await db.User.findAll();

    let filteredData = await policy.filterIndex(req.transaction, users, req.session.id);

    req.transaction.logger.info('Sending users');
    return res.status(200).json(filteredData);
};
