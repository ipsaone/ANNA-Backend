'use strict';

const winston=require("winston");


module.exports = (db) => async function (req, res) {
    const missionId = parseInt(req.params.missionId, 10);
    req.transaction.logger.info('Deleting mission #'+missionId);

    req.transaction.logger.info('Finding and deleting mission');
    let mission = await db.Mission.findByPk(missionId);
    await mission.destroy();

    req.transaction.logger.info('Sending response');
    return res.status(204).json({});
};
