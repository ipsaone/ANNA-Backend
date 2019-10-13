'use strict';

const policy = require('../../policies/mission_task_policy');
const joi = require('joi');
const schema = joi.object().keys({});

module.exports = (db) => async function (req, res) {

     // Validate user input
    const validation = joi.validate(req.body, schema);
    req.transaction.logger.debug('Validating schema');

    if (validation.error) {
        req.transaction.logger.debug('Bad input', {body : req.body});
        return res.boom.badRequest(validation.error);
    }

    // Check mission ID
    const missionId = parseInt(req.params.missionId, 10);

    // Check task ID
    const taskId = parseInt(req.params.taskId, 10);

    // Check mission and task are associated
    const mission = await db.Mission.findByPk(missionId);
    const task = await db.Task.findByPk(taskId);
    req.transaction.logger.info('Finding mission and task', {missionId, taskId});
    if (!task.missionId === missionId) {
        req.transaction.logger.info('Task doesn\'t belog to mission');
        return res.boom.badRequest('Task doesn\'t belong to this mission');
    }

    // Check user has permissions to delete the task
    req.transaction.logger.info('Invoking policies');
    const allowed = policy.filterDeleteTask(req.transaction, mission, req.session.auth);

    if (!allowed) {
        req.transaction.logger.info('Policies denied access');
        return res.boom.unauthorized();
    }

    // Delete the task and answer accordingly
    req.transaction.logger.info('Destroying task and sending response');
    await task.destroy();

    return res.status(204).json({});


};
