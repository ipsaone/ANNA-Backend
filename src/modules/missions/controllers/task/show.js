'use strict';

const policy = require('../../mission_policy');


module.exports = (db) => async function (req, res) {
    // Check mission ID
    const missionId = parseInt(req.params.missionId, 10);
    const mission = await db.Mission.findByPk(missionId);

    if (!mission) {
        return res.boom.notFound(`No mission with id ${missionId}`);
    }

    // Check task ID
    const taskId = parseInt(req.params.taskId, 10);

    // Check mission and task are associated
    const task = await db.Task.findByPk(taskId);
    if (!task.missionId === missionId) {
        return res.boom.badRequest('This task doesn\'t belong to this mission');
    }

    // Check user has permissions to see the task
    const allowed = policy.filterShowTask(req.transaction, req.session.auth);

    if (!allowed) {
        return res.boom.unauthorized();
    }

    // Delete the task and answer accordingly
    return res.status(204).json(task);
};
