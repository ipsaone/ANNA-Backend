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


/**
 * @param {obj} db - The databas.
 * @returns {Function} - The controller.
 */
module.exports = (db) =>

/**
 *
 * Updates an existing event.
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 */
    async function (req, res) {
        // Check route
        if (isNaN(parseInt(req.params.eventId, 10))) {
            return res.boom.badRequest('Event ID must be an integer');
        }
        const eventId = parseInt(req.params.eventId, 10)

        // Retrieve data
        const event = await db.Event.findByPk(eventId);
        if (!event) {
            return res.boom.notFound();
        }

        // Validate user input
        const validation = joi.validate(req.body, schema);
        if (validation.error) {
            return res.boom.badRequest(validation.error);
        }

        // Check authorization
        const authorized = await policy.filterUpdate(db, req.session.auth);
        if (!authorized) {
            return res.boom.unauthorized('You are not allowed to edit this event');
        }

        // Additional checks
        let registered = await event.getRegistered();
        if(req.body.maxRegistered < registered.length) {
            return res.boom.badRequest('Event size cannot be reduced (too many registered users)')
        }
        if (req.body.name) {
            req.body.name = req.body.name.toLowerCase();
        }



        // Update event
        await event.update(req.body);


        // Send response
        return res.status(200).json(event);


    };
