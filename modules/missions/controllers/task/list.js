'use strict';

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');
const db = require(path.join(root, './modules'));

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
