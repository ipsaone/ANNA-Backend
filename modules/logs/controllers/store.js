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
 * Create a new log and store it.
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 * @param {Object} handle - The error handling function.
 *
 * @returns {Object} Promise.
 *
 */
    async function (req, res) {
        let builder = policy.filterStore(db, req.body, req.session.auth)
        await db.Log.create(builder);
        return res.status(201).json(log);
    };
