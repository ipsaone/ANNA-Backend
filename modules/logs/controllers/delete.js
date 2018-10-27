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
 * Deletes an existing log.
 *
 * @param {obj} req     - The user request.
 * @param {obj} res     - The response to be sent.
 * @param {obj} handle  - The error handling function.
 *
 * @returns {Object} Promise.
 *
 */
    function (req, res, handle) {
        if (typeof req.params.logId !== 'string' || isNaN(parseInt(req.params.logId, 10))) {
            throw res.boom.badRequest('Log ID must be an integer');
        }
        const logId = parseInt(req.params.logId, 10);

        return policy.filterDelete(db, req.session.auth)
            .then(() => db.Log.destroy({where: {id: logId}}))
            .then((data) => {
                if (data === 1) {
                    return res.status(204).json({});
                } else if (data === 0) {
                    throw res.boom.notFound();
                } else {
                    throw res.boom.badImplementation('Too many rows deleted !');
                }
            })
            .catch((err) => handle(err));
    };
