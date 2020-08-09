'use strict';

const policy = require('../user_policy');
const joi = require('joi');

const schema = joi.object().keys({});

module.exports = (db) => async function (req, res) {

    // Validate user input
    req.transaction.logger.info('Validating schema');
    const validation = schema.validate(req.body);
    if (validation.error) {
        req.transaction.logger.info('Schema validation failed');
        return res.boom.badRequest(validation.error);
    }
    
    if (isNaN(parseInt(req.params.userId, 10))) {
        req.transaction.logger.info('User ID must be an integer');
        throw res.boom.badRequest('User ID must be an integer');
    }
    const userId = parseInt(req.params.userId, 10);

    req.transaction.logger.info('Finding user');
    const user = await db.User.findOne({
        where: {id: userId},
        include: [
            'groups',
            'events',
            'participatingMissions',
            'leaderMissions'
        ]
    });

    if (!user) {
        req.transaction.logger.info('User not found');
        return res.boom.notFound();
    }

    req.transaction.logger.info('Invoking policies');
    let filteredUser = await policy.filterShow(req.transaction, user);
    if(!filteredUser) {
        req.transaction.logger.info('Policies denied access');
        return res.boom.unauthorized();
    }

    req.transaction.logger.info('Returning user');
    return res.status(200).json(filteredUser);

};
