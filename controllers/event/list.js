'use strict';

const db = require('../../models');
const policy = require('../../policies/event_policy');

/**
 *
 * Gets all events.
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 * @param {Object} handle - The error handling function.
 *
 * @returns {Object} Promise.
 *
 */
module.exports = async function (req, res) {

    // Check user is authorized
    const authorized = policy.filterIndex();

    if (!authorized) {
        return false;
    }

    // Fetch all events
    const events = await db.Event.findAll();

    // Add attendants count to every event
    const toReturn = await Promise.all(events.map(async (ev) => {

        const registeredP = ev.getRegistered();
        const newEvent = await ev.toJSON();
        const registered = await registeredP;

        newEvent.registeredCount = registered.length;

        return newEvent;
    }));

    // Send response
    return res.status(200).json(toReturn);
};
