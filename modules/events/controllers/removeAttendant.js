'use strict';

const policy = require('../event_policy');

module.exports = (db) => async function (req, res) {
    if (isNaN(parseInt(req.params.eventId, 10))) {
        return res.boom.badRequest();
    }
    const eventId = parseInt(req.params.eventId, 10);

    let userId = req.session.auth;

    if (typeof req.params.userId !== 'undefined' && isNaN(parseInt(req.params.userId, 10))) {
        return res.boom.badRequest();
    } else if (typeof req.params.userId !== 'undefined') {
        userId = parseInt(req.params.userId, 10);
    }


    const allowed = await policy.filterDeleteRegistered(db, userId, req.session.auth);

    if (!allowed) {
        return res.boom.unauthorized();
    }

    const event = await db.Event.findById(eventId);

    if (!event) {
        return res.boom.notFound();
    }

    const user = await db.User.findById(userId);

    if (!user) {
        return res.boom.notFound('User not found');
    }

    await event.removeRegistered(userId);

    return res.status(201).json(event);

};
