'use strict';

const policy = require('../event_policy');

module.exports = (db) => async function (req, res) {
    if (isNaN(parseInt(req.params.eventId, 10))) {
        req.transaction.logger.info('Event ID must be an integer');
        return res.boom.badRequest('Event ID must be an integer');
    }
    const eventId = parseInt(req.params.eventId, 10);

    let userId = req.session.auth;
    if (!isNaN(parseInt(req.params.userId, 10))) {
        userId = parseInt(req.params.userId, 10);
    }


    req.transaction.logger.info('Invoking policies');
    const allowed = await policy.filterStoreRegistered(db, userId, req.session.auth);
    if (!allowed) {
        req.transaction.logger.info('Policies denied access');
        return res.boom.unauthorized();
    }

    req.transaction.logger.info('Finding event');
    const event = await db.Event.findByPk(eventId);
    if (!event) {
        req.transaction.logger.info('Event not found');
        return res.boom.notFound('Event not found');
    }

    req.transaction.logger.info('Finding user');
    const user = await db.User.findByPk(userId);
    if (!user) {
        req.transaction.logger.info('User not found');
        return res.boom.notFound('User not found');
    }

    req.transaction.logger.info('Checking event size');
    let registered = await event.getRegistered();
    if(registered.length == event.maxRegistered) {
        req.transaction.logger.info('Event is full');
        return res.boom.unauthorized('Event is full');
    }

    req.transaction.logger.info('Adding user to event');
    await event.addRegistered(userId);

    req.transaction.logger.info('Returning event');
    return res.status(201).json(event);
};
