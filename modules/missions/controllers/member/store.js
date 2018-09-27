'use strict';

const policy = require('../../mission_policy');

module.exports = (db) => async (req, res) => {

    if (isNaN(parseInt(req.params.missionId, 10))) {
        return res.boom.badRequest();
    }
    const missionId = parseInt(req.params.missionId, 10);
    let mission = await db.Mission.findById(missionId);

    if (isNaN(parseInt(req.params.memberId, 10))) {
        return res.boom.badRequest();
    }
    const memberId = parseInt(req.params.memberId, 10);

    const authorized = policy.filterStoreMember(mission, req.session.auth);
    if(!authorized) {
        return res.boom.unauthorized();
    }

    try {
        let mission = await db.Mission.findById(missionId);
        let data = await mission.addMember(memberId);

        return res.status(200).json(data);
        
        
    } catch (err) {
        return err;
    }

};