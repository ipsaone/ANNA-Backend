'use strict';

const policy = require('../../mission_policy');

module.exports = (db) => async function (req, res) {

    // Check mission ID
    if (isNaN(parseInt(req.params.missionId, 10))) {
        return res.boom.badRequest('Mission ID must be an integer');
    }
    const missionId = parseInt(req.params.missionId, 10);

    // Check task ID
    if (isNaN(parseInt(req.params.taskId, 10))) {
        return res.boom.badRequest('Task ID must be an integer');
    }
    const taskId = parseInt(req.params.taskId, 10);

    // Check mission and task are associated
    const mission = await db.Mission.findByPk(missionId);
    const task = await db.Task.findByPk(taskId);
    if (!task.missionId === missionId) {
        return res.boom.badRequest('Task doesn\'t belong to this mission');
    }

    // Check user has permissions to delete the task
    const allowed = policy.filterDeleteTask(db, mission, req.session.auth);

    if (!allowed) {
        return res.boom.unauthorized();
    }

    // Delete the task and answer accordingly
    await task.destroy();

    return res.status(204).json({});


};