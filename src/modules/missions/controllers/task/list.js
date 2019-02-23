'use strict';


module.exports = (db) => async function (req, res) {
    // Check mission ID
    const missionId = parseInt(req.params.missionId, 10);

    const mission = await db.Mission.findByPk(missionId);

    if (!mission) {
        return req.boom.notFound(`no mission with id ${missionId}`);
    }

    req.transaction.logger.warn('Needs calling policies here');

    const tasks = await mission.getTasks();

    return res.status(200).json(tasks);
};
