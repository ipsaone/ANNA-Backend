'use strict';

const policy = require('../../policies/mission_task_policy');
const joi = require('joi');

const schema = joi.object().keys({});

module.exports = (db) => async function (req, res) {
     // Validate user input
    const validation = schema.validate(req.body);
    req.transaction.logger.debug('Validating schema');

    if (validation.error) {
        req.transaction.logger.debug('Bad input', {body : req.body});
        return res.boom.badRequest(validation.error);
    }

    // Check mission ID
    const missionId = parseInt(req.params.missionId, 10);

    req.transaction.logger.info('Finding mission');
    const mission = await db.Mission.findByPk(missionId);

    if (!mission) {
        req.transaction.logger.info('Mission not found');
        return req.boom.notFound(`no mission with id ${missionId}`);
    }

    req.transaction.logger.info('Finding tasks');
    const tasks = await mission.getTasks();

    req.transaction.logger.info('Sending tasks');
    return res.status(200).json(tasks);
};
