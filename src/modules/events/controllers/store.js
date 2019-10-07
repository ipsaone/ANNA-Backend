'use strict';

const joi = require('joi');
const policy = require('../event_policy');

const schema = joi.object().keys({
    name: joi.string(),
    markdown: joi.string(),
    maxRegistered: joi.number().integer(),
    startDate: joi.string(),
    endDate: joi.string()
});

module.exports = (db) => async function (req, res) {
    if (typeof req.body.name !== 'string') {
        req.transaction.logger.info('Event name must be a string');
        return res.boom.badRequest('Event name must be a string');
    }

    // Validate user input
    req.transaction.logger.info('Validating schema');
    const validation = joi.validate(req.body, schema);
    if (validation.error) {
        req.transaction.logger.info('Schema validation failed', {error : validation.error})
        return res.boom.badRequest(validation.error);
    }

    // Additional checks
    req.transaction.logger.info('Checking event size');
    if(req.body.maxRegistered < 0) {
        req.transaction.logger.info('Error : negative event size', {maxRegistered : req.body.maxRegistered});
        return res.boom.badRequest('Event size cannot be negative')
    }

    // Adding creatorId
    req.body.creatorId = req.transaction.info.userId;


    req.transaction.logger.info('Invoking policies');
    const authorized = await policy.filterStore(req.transaction, req.session.auth);

    if (!authorized) {
        req.transaction.logger.info('Policies denied access');
        return res.boom.unauthorized();
    }

    req.transaction.logger.info('Creating event');
    const event = await db.Event.create(req.body);

    req.transaction.logger.debug('Returning new event');
    return res.status(201).json(event);


};
