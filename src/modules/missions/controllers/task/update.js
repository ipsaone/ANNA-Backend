'use strict';

const policy = require('../../policies/mission_task_policy');
const joi = require('@hapi/joi');
const schema = joi.object().keys({
    name: joi.string().optional(),
    done: joi.bool().optional(),
    id: joi.number().integer()
});

module.exports = (db) => async function (req, res) {
     // Validate user input
    const validation = schema.validate(req.body);
    req.transaction.logger.debug('Validating schema');

    if (validation.error) {
        req.transaction.logger.debug('Bad input', {body : req.body});
        return res.boom.badRequest(validation.error);
    }

    const missionId = parseInt(req.params.missionId, 10);
    const taskId = parseInt(req.params.taskId, 10);


    req.transaction.logger.info('Finding mission');
    const mission = await db.Mission.findByPk(missionId);

    if (!mission) {
        req.transaction.logger.info('Mission not found');
        return res.boom.notFound(`No mission with id ${missionId}`);
    }

    req.transaction.logger.info('Finding task');
    const task = await db.Task.findByPk(taskId);

    if (!task) {
        req.transaction.logger.info('Task not found');
        return res.boom.notFound(`No task with id ${taskId}`);
    }

    req.transaction.logger.info('Invoking policies');
    const updateContents = await policy.filterUpdateTask(req.transaction, req.body, req.session.auth);

    req.transaction.logger.info('Updating task');
    await task.update(updateContents);

    req.transaction.logger.info('Sending task');
    return res.status(200).json(task);

};
