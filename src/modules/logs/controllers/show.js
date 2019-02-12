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
    async function (req, res, handle) {
        if (isNaN(parseInt(req.params.logId, 10))) {
            throw res.boom.badRequest('Log ID must be an integer');
        }
        const logId = parseInt(req.params.logId, 10);

        let log = await db.Log.findOne({
            where: {id: logId},
            include: [
                'author',
                'files',
                'helpers'
            ]
        })

        log = await policy.filterShow(db, log, req.session.auth);
        if (log) {
            return res.status(200).json(log);
        }

        return res.boom.notFound();
    };
