'use strict';

module.exports = (db) => async (req, res) => {
    const missionId = parseInt(req.params.missionId, 10);

    req.transaction.logger.info('Finding mission')
    const mission = await db.Mission.findByPk(missionId, {
        include: [
            'tasks',
            'members'
        ]
    });

    if (!mission) {
        req.transaction.logger.info('Mission not found');
        return res.boom.notFound();
    }

    req.transaction.logger.info('Sending mission');
    return res.status(200).json(mission);
};
