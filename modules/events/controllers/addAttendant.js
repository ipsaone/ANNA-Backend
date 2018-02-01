'use strict';

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');
const db = require(path.join(root, './modules'));
const policy = require('../event_policy');

module.exports = async function (req, res) {
    if (isNaN(parseInt(req.params.eventId, 10))) {
        return res.boom.badRequest();
    }
    const eventId = parseInt(req.params.eventId, 10);

    let userId = req.session.auth;

    if (!isNaN(parseInt(req.params.userId, 10))) {
        userId = parseInt(req.params.userId, 10);
    }


    const allowed = await policy.filterStoreRegistered(eventId, userId, req.session.auth);

    if (!allowed) {
        return res.boom.unauthorized();
    }

    const event = await db.Event.findById(eventId);

    if (!event) {
        return res.boom.notFound('Event not found');
    }

    const user = await db.User.findById(userId);

    if (!user) {
        return res.boom.notFound('User not found');
    }

    await event.addRegistered(userId);

    return res.status(201).json(event);
};
