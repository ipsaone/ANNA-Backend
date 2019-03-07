'use strict';


module.exports = (db) => async function (req, res) {
    // Check mission ID
    const missionId = parseInt(req.params.missionId, 10);

    req.transaction.logger.info('Finding mission');
    const mission = await db.Mission.findByPk(missionId);

    if (!mission) {
        req.transaction.logger.info('Mission not found');
        return req.boom.notFound(`no mission with id ${missionId}`);
    }

    req.transaction.logger.warn('Needs calling policies here');

    req.transaction.logger.info('Finding tasks');
    const tasks = await mission.getTasks();

    req.transaction.logger.info('Sending tasks');
    return res.status(200).json(tasks);
};
