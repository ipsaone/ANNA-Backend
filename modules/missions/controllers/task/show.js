'use strict';

const db = require.main.require('./modules');
const policy = require('../../mission_policy');


module.exports = async function (req, res) {
    // Check mission ID
    if (isNaN(parseInt(req.params.missionId, 10))) {
        return res.boom.badRequest();
    }
    const missionId = parseInt(req.params.missionId, 10);
    const mission = await db.Mission.findById(missionId);

    if (!mission) {
        return res.boom.notFound(`No mission with id ${missionId}`);
    }

    // Check task ID
    if (isNaN(parseInt(req.params.taskId, 10))) {
        return res.boom.badRequest();
    }
    const taskId = parseInt(req.params.taskId, 10);

    // Check mission and task are associated
    const task = await db.Task.findById(taskId);

    if (!task.missionId === missionId) {
        return res.boom.badRequest();
    }

    // Check user has permissions to see the task
    const allowed = policy.filterShowTask(req.session.auth);

    if (!allowed) {
        return res.boom.unauthorized();
    }

    // Delete the task and answer accordingly
    return res.status(204).json(task);
};
