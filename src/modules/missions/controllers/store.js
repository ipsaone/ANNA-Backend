'use strict';

const joi = require('joi');


const schema = joi.object().keys({
    name: joi.string().trim(true).min(3).required(),
    markdown: joi.string().trim(true).min(5).optional(),
    description: joi.any().forbidden(),
    budgetAssigned: joi.number().min(0).optional(),
    budgetUsed: joi.number().min(0).optional(),
    groupId: joi.number().integer().positive().required(),
    leaderId: joi.number().integer().positive().optional()
});



module.exports = (db) => async (req, res) => {

    // Validate user input
    req.transaction.logger.info('Validating input');
    const validation = schema.validate(req.body);
    if (validation.error) {
        req.transaction.logger.info('Input denied by validator');
        return res.boom.badRequest(validation.error);
    }

    if (typeof req.body.leaderId === 'undefined') {
        req.transaction.logger.info('Setting automatic leaderId');
        req.body.leaderId = req.session.auth;
    }

    req.transaction.logger.info('Creating and sending mission');
    const mission = await db.Mission.create(req.body);
    return res.status(200).json(mission);
};
