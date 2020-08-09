'use strict';

const policy = require('../event_policy');
const joi = require('joi');

const schema = joi.object().keys({});


module.exports = (db) => async function (req, res) {
    // Validate user input
    const validation = schema.validate(req.body);
    req.transaction.logger.debug('Validating schema');

    if (validation.error) {
        req.transaction.logger.debug('Bad input', {body : req.body});
        return res.boom.badRequest(validation.error);
    }
    
    if (isNaN(parseInt(req.params.eventId, 10))) {
        req.transaction.logger.info('Event ID must be an integer');
        return res.boom.badRequest('Event ID must be an integer');
    }
    const eventId = parseInt(req.params.eventId, 10);

    req.transaction.logger.info('Invoking policies');
    const authorized = await policy.filterDelete(req.transaction, req.session.auth);

    if (!authorized) {
        req.transaction.logger.info('Policies denied access');
        return res.boom.unauthorized();
    }

    req.transaction.logger.info('Finding event');
    const event = await db.Event.findByPk(eventId);

    if (!event) {
        req.transaction.logger.info('Event not found');
        return res.boom.notFound();
    }

    req.transaction.logger.info('Destroying event');
    await event.destroy();

    req.transaction.logger.debug('Sending empty response');
    return res.status(204).json({});

};
