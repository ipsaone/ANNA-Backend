'use strict';

const db = require.main.require('./modules');
const policy = require('../mission_policy');

/**
 *
 * Updates an existing mission.
 *
 * @param {obj} req     - The user request.
 * @param {obj} res     - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 */

module.exports = async function (req, res) {
    if (isNaN(parseInt(req.params.missionId, 10))) {
        return res.boom.badRequest();
    }
    const missionId = parseInt(req.params.missionId, 10);

    const allowed = await policy.filterUpdate(req.session.auth);

    if (!allowed) {
        return res.boom.unauthorized();
    }

    try {
        await db.Missions.update(req.body, {where: {id: missionId}});
    } catch (err) {
        if (err instanceof db.Sequelize.ValidationError) {
            return res.boom.badRequest();
        }

        throw err;
    }

    return res.status(204).json({});
};
