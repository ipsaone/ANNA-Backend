'use strict';


const policy = require('../../policies/mission_task_policy');
const joi = require('joi');
const schema = joi.object().keys({
    name: joi.string().required(),
    done: joi.bool().required(),
    missionId: joi.number().integer().positive().required()
});


module.exports = (db) => async function (req, res) {
     // Validate user input
    const validation = joi.validate(req.body, schema);
    req.transaction.logger.debug('Validating schema');

    if (validation.error) {
        req.transaction.logger.debug('Bad input', {body : req.body});
        return res.boom.badRequest(validation.error);
    }

    const missionId = parseInt(req.params.missionId, 10);
    req.body.missionId = missionId;

    req.transaction.logger.info('Finding mission');
    const mission = await db.Mission.findByPk(missionId);
    if (!mission) {
        req.transaction.logger.info('Mission not found');
        return res.boom.notFound(`No mission with id ${missionId}`);
    }

    req.transaction.logger.info('Invoking policies');
    const authorized = await policy.filterStoreTask(req.transaction, mission, req.session.auth);
    if (!authorized) {
        req.transaction.logger.info('Policies denied request');
        return res.boom.unauthorized();
    }

    req.transaction.logger.info('Creating task');
    const task = await db.Task.create(req.body);

    req.transaction.logger.info('Sending task');
    return res.status(200).json(task);


};
