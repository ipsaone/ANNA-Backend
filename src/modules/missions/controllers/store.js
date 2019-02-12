'use strict';

const joi = require('joi');
const policy = require('../mission_policy');


const schema = joi.object().keys({
    name: joi.string().trim(true).min(3),
    markdown: joi.string().trim(true).min(5),
    description: joi.any().forbidden(),
    budgetAssigned: joi.number().min(0),
    budgetUsed: joi.number().min(0),
    groupId: joi.number().integer().positive(),
    leaderId: joi.number().integer().positive().optional()
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

    const mission = await db.Mission.create(req.body);
    return res.status(200).json(mission);
};
