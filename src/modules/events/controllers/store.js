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
        return res.boom.badRequest('Event name must be a string');
    }

    // Validate user input
    const validation = joi.validate(req.body, schema);
    if (validation.error) {
        return res.boom.badRequest(validation.error);
    }

    // Additional checks
    if(req.body.maxRegistered < 0) {
        return res.boom.badRequest('Event size cannot be negative')
    }


    const authorized = await policy.filterStore(db, req.session.auth);

    if (!authorized) {
        return res.boom.unauthorized();
    }
    const event = await db.Event.create(req.body);

    return res.status(201).json(event);


};
