'use strict';

const joi = require('joi');
const policy = require('../mission_policy');


const schema = joi.object().keys({
    name: joi.string().min(3),
    markdown: joi.string().min(5),
    description: joi.any().forbidden(),
    budgetAssigned: joi.number(),
    budgetUsed: joi.number(),
    groupId: joi.number().integer(),
    leaderId: joi.number().integer().optional()
});

/**
 *
 * Create and store a new mission.
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 */

module.exports = (db) => async (req, res) => {

    const authorized = await policy.filterStore(db, req.session.auth);
    if (!authorized) {
        return res.boom.unauthorized();
    }

    // Validate user input
    const validation = joi.validate(req.body, schema);
    if (validation.error) {
        return res.boom.badRequest(validation.error);
    }

    if (typeof req.body.leaderId === 'undefined') {
        req.body.leaderId = req.session.auth;
    }

    let allowed = policy.filterStore(db, req.session.id);
    if(!allowed) {
        return res.boom.unauthorized();
    }

    const mission = await db.Mission.create(req.body);
    return res.status(200).json(mission);
};
