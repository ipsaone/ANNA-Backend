'use strict';

/**
 * @api {delete} /missions/:missionId Delete a mission
 * @apiName delete
 * @apiGroup Missions
 */

const joi = require('joi');
const schema = joi.object().keys({});


module.exports = (db) => async function (req, res) {
     // Validate user input
    const validation = joi.validate(req.body, schema);
    req.transaction.logger.debug('Validating schema');

    if (validation.error) {
        req.transaction.logger.debug('Bad input', {body : req.body});
        return res.boom.badRequest(validation.error);
    }

    const missionId = parseInt(req.params.missionId, 10);
    req.transaction.logger.info('Deleting mission #'+missionId);

    req.transaction.logger.info('Finding and deleting mission');
    let mission = await db.Mission.findByPk(missionId);
    await mission.destroy();

    req.transaction.logger.info('Sending response');
    return res.status(204).json({});
};
