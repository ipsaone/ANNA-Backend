'use strict';

const policy = require('../../policies/mission_member_policy');

module.exports = (db) => async (req, res) => {
    const missionId = parseInt(req.params.missionId, 10);
    req.transaction.logger.info('Finding mission');
    const mission = await db.Mission.findByPk(missionId);

    const memberId = parseInt(req.params.memberId, 10);

    req.transaction.logger.info('Invoking policies');
    const authorized = await policy.filterDeleteMember(req.transaction, mission, req.session.auth);
    if(!authorized) {
        req.transaction.logger.info('Policies denied request');
        return res.boom.unauthorized();
    }

    req.transaction.logger.info('Removing member from mission');
    let data = await mission.removeMember(memberId);

    req.transaction.logger.info('Sending response');
    return res.status(200).json(data);

};