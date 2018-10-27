'use strict';

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

module.exports = (db) => async function (req, res) {
    if (isNaN(parseInt(req.params.missionId, 10))) {
        return res.boom.badRequest('Mission ID must be an integer');
    }
    const missionId = parseInt(req.params.missionId, 10);

    const allowed = await policy.filterUpdate(db, req.session.auth);
    if (!allowed) {
        return res.boom.unauthorized();
    }
    if(req.body.description) {
        return res.boom.badRequest('Description should be computed from markdown');
    }

    let mission = await db.Mission.findByPk(missionId);
    await mission.update(req.body);
   
    
    return res.status(200).json(mission);
};
