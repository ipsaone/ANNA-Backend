'use strict';

/**
 * @api {delete} /users/:userId Delete a user
 * @apiName delete
 * @apiGroup Users
 */

const policy = require('../user_policy');
const joi = require('joi');

const schema = joi.object().keys({});

module.exports = (db) => async function (req, res) {
    // Validate user input
    req.transaction.logger.info('Validating schema');
    const validation = joi.validate(req.body, schema);
    if (validation.error) {
        req.transaction.logger.info('Schema validation failed');
        return res.boom.badRequest(validation.error);
    }
    
    const userId = parseInt(req.params.userId, 10);

    req.transaction.logger.info('Invoking policies');
    let authorized = policy.filterDelete(req.transaction, req.params.userId, req.session.auth);
    if(!authorized) {
        req.transaction.logger.info('Policies denied access');
        return res.boom.unauthorized();
    }

    req.transaction.logger.info('Destroyign user groups');
    await db.UserGroup.destroy({where: {userId}});

    req.transaction.logger.info('Destroying user');
    await db.User.destroy({where: {id: userId}});

    req.transaction.logger.info('Sending response');
    return res.status(200).send({});
};
