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

    // Validate user input
    req.transaction.logger.info('Validating input');
    const validation = joi.validate(req.body, schema);
    if (validation.error) {
        req.transaction.logger.info('Input denied by validator');
        return res.boom.badRequest(validation.error);
    }

    // Check policies
    req.transaction.logger.info('Invoking policies');
    const authorized = await policy.filterStore(req.transaction, req.session.auth);
    if (!authorized) {
        req.transaction.logger.info('Policies denier mission store');
        return res.boom.unauthorized();
    }


    if (typeof req.body.leaderId === 'undefined') {
        req.transaction.logger.info('Setting automatic leaderId');
        req.body.leaderId = req.session.auth;
    }

    req.transaction.logger.info('Creating and sending mission');
    const mission = await db.Mission.create(req.body);
    return res.status(200).json(mission);
};
