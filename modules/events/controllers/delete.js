'use strict';

const policy = require('../event_policy');

/**
 *
 * Deletes an event.
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 */

module.exports = (db) => async function (req, res) {
    if (isNaN(parseInt(req.params.eventId, 10))) {
        return res.boom.badRequest();

    }
    const eventId = parseInt(req.params.eventId, 10);

    const authorized = await policy.filterDelete(db, req.session.auth);

    if (!authorized) {
        return res.boom.unauthorized();
    }

    const event = await db.Event.findById(eventId);

    if (!event) {
        return res.boom.notFound();
    }

    await event.destroy();

    return res.status(204).json({});

};
