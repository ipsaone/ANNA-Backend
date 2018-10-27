'use strict';

const policy = require('../mission_policy');

/**
 *
 * Create and store a new mission.
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 */

module.exports = (db) => async (req, res) => {

    const authorized = await policy.filterStore(db, req.session.auth);
    if (!authorized) {
        return res.boom.unauthorized();
    }
    if(req.body.description) {
        return res.boom.badRequest('Description should be compiled from markdown');
    }


    if (typeof req.body.leaderId === 'undefined') {
        req.body.leaderId = req.session.auth;
    }

    const mission = await db.Mission.create(req.body);
    return res.status(200).json(mission);
};
