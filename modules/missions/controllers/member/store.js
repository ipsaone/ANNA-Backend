'use strict';

const policy = require('../../mission_policy');

module.exports = (db) => async (req, res) => {
    const authorized = policy.filterStoreMember();

    if(!authorized) {
        return res.boom.unauthorized();
    }

    if (isNaN(parseInt(req.params.missionId, 10))) {
        return res.boom.badRequest();
    }
    const missionId = parseInt(req.params.missionId, 10);

    if (isNaN(parseInt(req.params.memberId, 10))) {
        return res.boom.badRequest();
    }
    const memberId = parseInt(req.params.memberId, 10);

    try {
        let mission = await db.Mission.findById(missionId);
        let data = await mission.addMember(memberId);

        return res.status(200).json(data);
        
        
    } catch (err) {
        return err;
    }

};