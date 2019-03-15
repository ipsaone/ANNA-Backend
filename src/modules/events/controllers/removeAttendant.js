'use strict';

const policy = require('../event_policy');

module.exports = (db) => async function (req, res) {
    if (isNaN(parseInt(req.params.eventId, 10))) {
        req.transaction.logger.info('Event ID must be an integer');
        return res.boom.badRequest('Event ID must be an integer');
    }
    const eventId = parseInt(req.params.eventId, 10);

    let userId = req.session.auth;
    if (typeof req.params.userId !== 'undefined' && isNaN(parseInt(req.params.userId, 10))) {
        req.transaction.logger.info('User ID must be an integer');
        return res.boom.badRequest('User ID must be an integer');
    } else if (typeof req.params.userId !== 'undefined') {
        userId = parseInt(req.params.userId, 10);
    }


    req.transaction.logger.info('Invoking policies');
    const allowed = await policy.filterDeleteRegistered(db, userId, req.session.auth);
    if (!allowed) {
        req.transaction.logger.info('Policies denied access');
        return res.boom.unauthorized();
    }

    req.transaction.logger.info('Finding event');
    const event = await db.Event.findByPk(eventId, {include: ['registered']});
    if (!event) {
        req.transaction.logger.info('Event not found');
        return res.boom.notFound();
    }

    req.transaction.logger.info('Finding user');
    const user = await db.User.findByPk(userId);
    if (!user) {
        req.transaction.logger.info('User not found');
        return res.boom.notFound('User not found');
    }


    req.transaction.logger.info('Removing user from event');
    await event.removeRegistered(userId);

    req.transaction.logger.info('Sending updated event');
    return res.status(201).json(event);

};
