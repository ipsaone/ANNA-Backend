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
    async function (req, res) {
        if (typeof req.params.logId !== 'string' || isNaN(parseInt(req.params.logId, 10))) {
            throw res.boom.badRequest('Log ID must be an integer');
        }
        const logId = parseInt(req.params.logId, 10);

        let authorized = await policy.filterDelete(db, req.session.auth);
        
        if(!authorized) {
            return res.boom.unauthorized();
        }

        let data = await db.Log.destroy({where: {id: logId}});
        if (data === 1) {
            return res.status(204).json({});
        } else if (data === 0) {
            throw res.boom.badRequest("Log not found");
        } else {
            throw res.boom.badImplementation('Too many rows deleted !');
        }
    };
