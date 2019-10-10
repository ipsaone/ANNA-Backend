'use strict';

const policy = require('../../policies/mission_task_policy');


module.exports = (db) => async function (req, res) {
    // Check mission ID
    const missionId = parseInt(req.params.missionId, 10);
    req.transaction.logger.info('Finding mission');
    const mission = await db.Mission.findByPk(missionId);

    if (!mission) {
        req.transaction.logger.info('Mission not found');
        return res.boom.notFound(`No mission with id ${missionId}`);
    }

    // Check task ID
    const taskId = parseInt(req.params.taskId, 10);

    // Check mission and task are associated
    req.transaction.logger.info('Finding task');
    const task = await db.Task.findByPk(taskId);
    if (!task.missionId === missionId) {
        req.transaction.logger.info('Task doesn\'t belong to mission');
        return res.boom.badRequest('This task doesn\'t belong to this mission');
    }

    // Send the task
    req.transaction.logger.info('Sending task');
    return res.status(200).json(task);
};
