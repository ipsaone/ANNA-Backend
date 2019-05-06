'use strict';

const joi = require('joi');
const policy = require('../user_policy');

const schema = joi.object().keys({
    username: joi.string().min(4),
    email: joi.string().min(5),
    password: joi.string().min(6)
});

module.exports = (db) => async function (req, res) {

    // Validate user input
    req.transaction.logger.info('Validating schema');
    const validation = joi.validate(req.body, schema);
    if (validation.error) {
        req.transaction.logger.info('Schema validation failed');
        return res.boom.badRequest(validation.error);
    }

    req.transaction.logger.info('Invoking policies');
    let allowed = policy.filterStore(req.transaction, req.session.auth)
    if (!allowed) {
        req.transaction.logger.info('Policies denied access');
        return res.boom.unauthorized();
    }

    req.transaction.logger.info('Creating user');
    const user = await db.User.create(req.body);

    req.transaction.logger.info('Returning user');
    return res.status(201).json(user);

};
