'use strict';

const joi = require('joi');

const schema = joi.object().keys({
    name: joi.string().trim(true).min(3),
    markdown: joi.string().trim(true).min(5),
    description: joi.any().forbidden(),
    budgetAssigned: joi.number().min(0),
    budgetUsed: joi.number().min(0),
    groupId: joi.number().integer().positive(),
    leaderId: joi.number().integer().positive()
});



module.exports = (db) => async function (req, res) {
    const missionId = parseInt(req.params.missionId, 10);

    // Validate user input
    req.transaction.logger.info('Validating input') ;
    const validation = joi.validate(req.body, schema);
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

    req.transaction.logger.info('Updating mission');
    await mission.update(req.body);
   
    req.transaction.logger.info('Sending mission');
    return res.status(200).json(mission);
};
