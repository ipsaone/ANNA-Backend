'use strict';

const db = require('../../models');
const policy = require('../../policies/event_policy');

/**
 *
 * Deletes an event.
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 * @param {Object} handle - The error handling function.
 *
 * @returns {Object} Promise.
 *
 */

module.exports = async function (req, res) {
    if (isNaN(parseInt(req.params.eventId, 10))) {
        res.boom.badRequest();

        return;
    }
    const eventId = parseInt(req.params.eventId, 10);

    const authorized = await policy.filterDelete(req.session.auth);

    if (!authorized) {
        res.boom.unauthorized();

        return;
    }

    const event = await db.Event.findById(eventId);

    if (!event) {
        res.boom.notFound();

        return;
    }

    await event.destroy();

    return res.status(204).json({});

};
