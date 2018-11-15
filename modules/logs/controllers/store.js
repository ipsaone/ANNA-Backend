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
        let authorized = policy.filterStore(db, req.session.auth);
        if(!authorized) {
            return res.boom.unauthorized();
        }

        let log = await db.Log.create(req.body);
        return res.status(201).json(log);
    };
