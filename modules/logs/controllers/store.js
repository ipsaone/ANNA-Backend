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
    function (req, res, handle) {
        return policy.filterStore(req.body, req.session.auth)
            .then((builder) => db.Log.create(builder))
            .then((log) => res.status(201).json(log))
            .catch((err) => {
                if (err instanceof db.Sequelize.ValidationError) {
                    res.boom.badRequest(err);
                }
                throw err;
            })
            .catch((err) => handle(err));
    };
