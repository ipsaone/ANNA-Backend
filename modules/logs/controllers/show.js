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
 * Get a single log.
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 * @param {Object} handle - The error handling function.
 *
 * @returns {Object} Promise.
 *
 */
    function (req, res, handle) {
        if (isNaN(parseInt(req.params.logId, 10))) {
            throw res.boom.badRequest();
        }
        const logId = parseInt(req.params.logId, 10);

        return db.Log.findOne({
            where: {id: logId},
            include: [
                'author',
                'files',
                'helpers'
            ]
        })
            .then((log) => policy.filterShow(log, req.session.auth))
            .then((log) => {
                if (log) {
                    return res.status(200).json(log);
                }
                throw res.boom.notFound();

            })
            .catch((err) => handle(err));
    };
