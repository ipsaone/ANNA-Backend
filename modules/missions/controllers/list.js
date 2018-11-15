'use strict';

const policy = require('../mission_policy');

/**
 *
 * Get all existing missions.
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 */

module.exports = (db) => async (req, res) => {
    const authorized = await policy.filterIndex(db);

    if (!authorized) {
        return res.boom.unauthorized();
    }

    const missions = await db.Mission.findAll({
        attributes: { 
            include: [[db.Sequelize.fn("COUNT", db.Sequelize.col("members.id")), "memberCount"]] 
        },
        include: [
            {model: db.User, as: 'members'}
        ],
        group: [
            'Mission.id'
        ]
    });


    return res.status(200).json(missions);
};
