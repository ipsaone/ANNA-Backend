'use strict';

const policy = require('../event_policy');
const joi = require('joi');

const schema = joi.object().keys({
    name: joi.string(),
    markdown: joi.string(),
    maxRegistered: joi.number().integer(),
    startDate: joi.string(),
    endDate: joi.string()
});


module.exports = (db) =>

    async function (req, res) {
        // Check route
        if (isNaN(parseInt(req.params.eventId, 10))) {
            req.transaction.logger.info('Event ID must be an integer');
            return res.boom.badRequest('Event ID must be an integer');
        }
        const eventId = parseInt(req.params.eventId, 10)

        // Retrieve data
        req.transaction.logger.info('Finding event')
        const event = await db.Event.findByPk(eventId);
        if (!event) {
            req.transaction.logger.info('Event not found');
            return res.boom.notFound();
        }

        // Validate user input
        req.transaction.logger.info('Validating schema');
        const validation = joi.validate(req.body, schema);
        if (validation.error) {
            req.transaction.logger.info('Schema validation error', {error : validation.error});
            return res.boom.badRequest(validation.error);
        }

        // Adding creatorId
        req.body.creatorId = req.transaction.info.userId;

        // Check authorization
        req.transaction.logger.info('Invoking policies');
        const authorized = await policy.filterUpdate(req.transaction, req.session.auth);
        if (!authorized) {
            req.transaction.logger.info('Policies denied access');
            return res.boom.unauthorized('You are not allowed to edit this event');
        }

        // Additional checks
        req.transaction.logger.info('Checking new size');
        let registered = await event.getRegistered();
        if(req.body.maxRegistered < registered.length) {
            req.transaction.logger.info('New size too small', {maxRegistered : req.body.maxRegistered, registered : registered.length});
            return res.boom.badRequest('Event size cannot be reduced (too many registered users)')
        }



        // Update event
        req.transaction.logger.info('Updating event');
        await event.update(req.body);


        // Send response
        req.transaction.logger.debug('Returning event');
        return res.status(200).json(event);


    };
