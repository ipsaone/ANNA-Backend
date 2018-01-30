'use strict';

const db = require.main.require('./modules');
const policy = require('../mission_policy');

/**
 *
 * Get all existing missions.
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 */

module.exports = async (req, res) => {
    const authorized = await policy.filterIndex();

    if (!authorized) {
        return res.boom.unauthorized();
    }

    const missions = await db.Mission.findAll();


    return res.status(200).json(missions);
};
