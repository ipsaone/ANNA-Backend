'use strict';

const policy = require('../log_policy');


/**
 *
 * @param {obj} db     - The database.
 * @returns {Function} - The controller.
 *
 */
module.exports = (db) =>

/**
 *
 * Updates an existing log.
 *
 * @param {obj} req     - The user request.
 * @param {obj} res     - The response to be sent.
 * @param {obj} handle  - The error handling function.
 *
 * @returns {Object} Promise.
 *
 */
    async function (req, res) {
        if (isNaN(parseInt(req.params.logId, 10))) {
            throw res.boom.badRequest();
        }
        const logId = parseInt(req.params.logId, 10);

        const builder = await policy.filterUpdate(db, req.body, logId, req.session.auth);

        if (!builder || Object.keys(builder).length === 0) {
            return res.boom.unauthorized();
        }

        const log = await db.Log.findById(logId);

        await log.update(builder);

        return res.status(202).json(log);
    };
