'use strict';

const policy = require('../../user_policy');

const joi = require('joi');
const schema = joi.object().keys({});


module.exports = (db) => async function (req, res) {
    const userId = parseInt(req.params.userId, 10);
    const groupId = parseInt(req.params.groupId, 10);

    // Validate user input
    req.transaction.logger.info('Validating schema');
    const validation = joi.validate(req.body, schema);
    if (validation.error) {
        req.transaction.logger.info('Schema validation failed');
        return res.boom.badRequest(validation.error);
    }
    
    req.transaction.logger.info('Invoking policies');
    const allowed = await policy.filterDeleteGroup(req.transaction, groupId, userId, req.session.auth);
    if (!allowed) {
        req.transaction.logger.info('Policies denied request');
        return res.boom.unauthorized();
    }

    req.transaction.logger.info('Finding user');
    const user = await db.User.findByPk(userId);

    req.transaction.logger.info('Removing group');
    await user.removeGroup(groupId);

    req.transaction.logger.info('Sending empty response');
    return res.status(204).send();
};
