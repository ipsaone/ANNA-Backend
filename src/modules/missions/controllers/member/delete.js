'use strict';

const policy = require('../../mission_policy');

module.exports = (db) => async (req, res) => {
    if (isNaN(parseInt(req.params.missionId, 10))) {
        return res.boom.badRequest('Mission ID must be an integer');
    }
    const missionId = parseInt(req.params.missionId, 10);
    const mission = await db.Mission.findByPk(missionId);

    if (isNaN(parseInt(req.params.memberId, 10))) {
        return res.boom.badRequest('Member ID must be an integer');
    }
    const memberId = parseInt(req.params.memberId, 10);

    const authorized = policy.filterDeleteMember(db, mission, req.session.auth);
    if(!authorized) {
        return res.boom.unauthorized();
    }

    let data = await mission.removeMember(memberId);

    return res.status(200).json(data);

};