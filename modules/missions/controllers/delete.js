'use strict';

const policy = require('../mission_policy');

/**
 *
 * Delete an existing mission.
 *
 * @param {obj} req     - The user request.
 * @param {obj} res     - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 */

module.exports = (db) => async function (req, res) {
    if (isNaN(parseInt(req.params.missionId, 10))) {
        return res.boom.badRequest();
    }
    const missionId = parseInt(req.params.missionId, 10);

    const allowed = await policy.filterDelete(req.session.auth);

    if (!allowed) {
        return res.boom.unauthorized();
    }

    await db.Missions.destroy({where: {id: missionId}});

    return res.status(204).json({});
};
