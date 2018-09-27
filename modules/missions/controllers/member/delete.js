'use strict';

const policy = require('../../mission_policy');

module.exports = (db) => async (req, res) => {
    if (isNaN(parseInt(req.params.missionId, 10))) {
        return res.boom.badRequest();
    }
    const missionId = parseInt(req.params.missionId, 10);
    const mission = await db.Mission.findById(missionId);

    if (isNaN(parseInt(req.params.memberId, 10))) {
        return res.boom.badRequest();
    }
    const memberId = parseInt(req.params.memberId, 10);

    const authorized = policy.filterDeleteMember(mission, req.session.auth);
    if(!authorized) {
        return res.boom.unauthorized();
    }

    try {
        let data = await mission.removeMember(memberId);

        return res.status(200).json(data);
        
        
    } catch (err) {
        return err;
    }

};