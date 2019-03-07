'use strict';

const policy = require('../mission_policy');
const winston=require("winston");

/**
 *
 * Delete an existing mission.
 *
 * @param {obj} req     - The user request.
 * @param {obj} res     - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 */

module.exports = (db) => async function (req, res) {
    const missionId = parseInt(req.params.missionId, 10);
    req.transaction.logger.info('Deleting mission #'+missionId);

    req.transaction.logger.debug('Invoking policy');
    const allowed = await policy.filterDelete(req.transaction, req.session.auth);

    if (!allowed) {
        req.transaction.logger.info('Policy denied deletion');
        return res.boom.unauthorized();
    }

    req.transaction.logger.info('Finding and deleting mission');
    let mission = await db.Mission.findByPk(missionId);
    await mission.destroy();

    req.transaction.logger.info('Sending response');
    return res.status(204).json({});
};
