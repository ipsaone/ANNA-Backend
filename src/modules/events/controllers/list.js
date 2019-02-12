'use strict';

const policy = require('../event_policy');
const repo = require('../repositories');


module.exports = (db) =>

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
    async function (req, res) {

    // Check user is authorized
        const authorized = policy.filterIndex(db);

        if (!authorized) {
            return false;
        }

        const list = await repo.list(db);

        // Send response
        return res.status(200).json(list);
    };
