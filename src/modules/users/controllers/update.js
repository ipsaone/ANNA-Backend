'use strict';

const joi = require('joi');
const policy = require('../user_policy');

const schema = joi.object().keys({
    username: joi.string().min(4),
    email: joi.string().min(5),
    password: joi.string().min(6)
});


module.exports = (db) => async function (req, res) {
    const userId = parseInt(req.params.userId, 10);

    // Validate user input
    req.transaction.logger.info('Validating schema');
    const validation = joi.validate(req.body, schema);
    if (validation.error) {
        req.transaction.logger.info('Schema validation error');
        return res.boom.badRequest(validation.error);
    }

    req.transaction.logger.info('Invoking policies');
    let authorized = policy.filterUpdate(db, req.params.userId, req.session.auth);
    if(!authorized) {
        req.transaction.logger.info('Policies denied access');
        return res.boom.unauthorized();
    }

    req.transaction.logger.info('Finding user');
    const user = await db.User.findByPk(userId);

    req.transaction.logger.info('Updating user');
    await user.update(req.body);

    req.transaction.logger.info('Sending updated user');
    return res.status(200).json(user);
};
