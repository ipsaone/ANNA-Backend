'use strict';

const db = require.main.require('./modules');

module.exports = async function (req, res) {
    // Check mission ID
    if (isNaN(parseInt(req.params.missionId, 10))) {
        return res.boom.badRequest();
    }
    const missionId = parseInt(req.params.missionId, 10);

    const mission = await db.Mission.findById(missionId);

    if (!mission) {
        return req.boom.notFound(`no mission with id ${missionId}`);
    }

    const tasks = await mission.getTasks();

    return res.status(200).json(tasks);
};
