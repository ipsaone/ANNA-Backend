'use strict';

const policy = require('../../policies/mission_member_policy');

module.exports = (db) => async (req, res) => {

    const missionId = parseInt(req.params.missionId, 10);
    req.transaction.logger.info('Finding mission');
    let mission = await db.Mission.findByPk(missionId);

    
    const memberId = parseInt(req.params.memberId, 10);

    if(mission.leaderId == memberId) {
        req.transaction.logger.info('Cannot add the leader as member');
        return res.boom.badRequest("Cannot add the leader as member");
    }

    req.transaction.logger.info('Invoking policies');
    const authorized = await policy.filterStoreMember(req.transaction, mission, req.session.auth);
    if(!authorized) {
        req.transaction.logger.info('Policies denied request');
        return res.boom.unauthorized();
    }

    req.transaction.logger.info('Adding member and sending');
    let data = await mission.addMember(memberId);
    return res.status(200).json(data);
        
       

};