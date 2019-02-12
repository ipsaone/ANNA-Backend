'use strict';

const policy = require('../log_policy');

/**
 *
 * @param {obj} db     - The database.
 *
 *
 */

module.exports = (db) =>

/**
 *
 * Get all existing logs.
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 * @param {Object} handle - The error handling function.
 *
 * @returns {Object} Promise.
 *
 */
    async function (req, res) {
        let logs = await  db.Log.findAll({include: ['author']});
        logs = await policy.filterIndex(db, logs, req.session.auth);
        res.status(200).json(logs);
    };
