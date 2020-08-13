'use strict';

const joi = require('joi');
const policy = require('../policies/mission_policy.js');

const schema = joi.object().keys({
    name: joi.string().trim(true).min(3).optional(),
    markdown: joi.string().trim(true).min(5).optional(),
    description: joi.any().forbidden(),
    budgetAssigned: joi.number().min(0).optional(),
    budgetUsed: joi.number().min(0).optional(),
    groupId: joi.number().integer().positive().optional(),
    leaderId: joi.number().integer().positive().optional()
});



module.exports = (db) => async function (req, res) {
    const missionId = parseInt(req.params.missionId, 10);

    req.transaction.logger.info('Validating input') ;
    const validation = schema.validate(req.body);
    if (validation.error) {
        req.transaction.logger.info('Input refused by validator');
        return res.boom.badRequest(validation.error);
    }

    req.transaction.logger.info('Finding mission');
    let mission = await db.Mission.findByPk(missionId);
    if(!mission) {
        req.transaction.logger.info('Mission not found');
        return res.boom.notFound();
    }

    req.transaction.logger.info('Invoking policies');
    const authorized = await policy.filterUpdate(req.transaction, mission, req.session.auth);
    if(!authorized) {
        req.transaction.logger.info('Policies denied request');
        return res.boom.unauthorized();
    }

    req.transaction.logger.info('Updating mission');
    await mission.update(req.body);
   
    req.transaction.logger.info('Sending mission');
    return res.status(200).json(mission);
};
