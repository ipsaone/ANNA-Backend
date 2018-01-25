'use strict';

const policy = require.main.require('./policies/event_policy');
const repo = require.main.require('./repositories/event');

/**
 *
 * Gets all events.
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
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

    const list = await repo.list();

    // Send response
    return res.status(200).json(list);
};
