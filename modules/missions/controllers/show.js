'use strict';

const policy = require('../mission_policy');


/**
 *
 * Get a single mission.
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 */

module.exports = (db) => async (req, res) => {
    if (isNaN(parseInt(req.params.missionId, 10))) {
        return res.boom.badRequest();
    }
    const missionId = parseInt(req.params.missionId, 10);

    const authorized = policy.filterShow();

    if (!authorized) {
        return req.boom.unauthorized();
    }

    const mission = await db.Mission.findById(missionId, {
        include: [
            'tasks',
            'members'
        ]
    });

    if (!mission) {
        return res.boom.notFound();
    }

    return res.status(200).json(mission);
};
