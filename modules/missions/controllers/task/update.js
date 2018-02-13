'use strict';

const policy = require('../../mission_policy');

module.exports = (db) => async function (req, res) {
    if (isNaN(parseInt(req.params.missionId, 10))) {
        return res.boom.badRequest();
    }
    const missionId = parseInt(req.params.missionId, 10);


    if (isNaN(parseInt(req.params.taskId, 10))) {
        return res.boom.badRequest();
    }
    const taskId = parseInt(req.params.taskId, 10);


    const mission = await db.Mission.findById(missionId);

    if (!mission) {
        return res.boom.notFound(`No mission with id ${missionId}`);
    }

    const task = await db.Task.findById(taskId);

    if (!task) {
        return res.boom.notFound(`No task with id ${taskId}`);
    }

    const updateContents = await policy.filterUpdateTask(req.body, req.session.auth);

    await task.update(updateContents);

    return res.status(200).json(task);

};
