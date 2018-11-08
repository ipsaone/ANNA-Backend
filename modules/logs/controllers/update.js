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
            throw res.boom.badRequest('Log ID must be an integer');
        }
        const logId = parseInt(req.params.logId, 10);

        const allowed = await policy.filterUpdate(db,logId, req.session.auth);
        if (!allowed) {
            return res.boom.unauthorized();
        }

        const log = await db.Log.findByPk(logId);

        await log.update(builder);

        return res.status(202).json(log);
    };
