'use strict';

const joi = require('joi');
const policy = require('../mission_policy');

const schema = joi.object().keys({
    name: joi.string(),
    markdown: joi.string(),
    description: joi.any().forbidden(),
    budgetAssigned: joi.number(),
    budgetUsed: joi.number(),
    groupId: joi.number().integer(),
    leaderId: joi.number().integer()
});

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

    let mission = await db.Mission.findByPk(missionId);
    await mission.update(req.body);
   
    
    return res.status(200).json(mission);
};
