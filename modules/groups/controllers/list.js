'use strict';

const db = require.main.require('./modules');

/**
 *
 * Get all existing groups.
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 */

module.exports = async function (req, res) {
    const groups = await db.Group.findAll({include: ['users']});

    return res.json(groups);
};

