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
    function (req, res, handle) {
        if (isNaN(parseInt(req.params.logId, 10))) {
            throw res.boom.badRequest();
        }
        const logId = parseInt(req.params.logId, 10);

        return policy.filterUpdate(req.body, logId, req.session.auth)
            .then((builder) => db.Log.update(builder, {where: {id: logId}}))
            .then(() => res.status(204).json({}))
            .catch((err) => handle(err));
    };
