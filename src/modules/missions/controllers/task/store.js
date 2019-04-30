'use strict';


const policy = require('../../policies/mission_task_policy');


module.exports = (db) => async function (req, res) {
    const missionId = parseInt(req.params.missionId, 10);
    req.body.missionId = missionId;

    req.transaction.logger.info('Finding mission');
    const mission = await db.Mission.findByPk(missionId);
    if (!mission) {
        req.transaction.logger.info('Mission not found');
        return res.boom.notFound(`No mission with id ${missionId}`);
    }

    req.transaction.logger.info('Invoking policies');
    const authorized = await policy.filterStoreTask(req.transaction, mission, req.session.auth);
    if (!authorized) {
        req.transaction.logger.info('Policies denied request');
        return res.boom.unauthorized();
    }

    req.transaction.logger.info('Creating task');
    const task = await db.Task.create(req.body);

    req.transaction.logger.info('Sending task');
    return res.status(200).json(task);


};
