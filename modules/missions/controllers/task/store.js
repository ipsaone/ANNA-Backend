'use strict';

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');
const db = require(path.join(root, './modules'));
const policy = require('../../mission_policy');

module.exports = async function (req, res) {
    if (isNaN(parseInt(req.params.missionId, 10))) {
        return res.boom.badRequest();
    }
    const missionId = parseInt(req.params.missionId, 10);

    req.body.missionId = missionId;
    const mission = await db.Mission.findById(missionId);

    if (!mission) {
        return res.boom.notFound(`No mission with id ${missionId}`);
    }

    const authorized = await policy.filterStoreTask(req.session.auth);

    if (!authorized) {
        return res.boom.unauthorized();
    }


    const task = await db.Task.create(req.body);


    return res.status(200).json(task);


};
