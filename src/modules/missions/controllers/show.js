'use strict';

const joi = require('@hapi/joi');
const schema = joi.object().keys({});

module.exports = (db) => async (req, res) => {
     // Validate user input
     const validation = schema.validate(req.body);
     req.transaction.logger.debug('Validating schema');

     if (validation.error) {
         req.transaction.logger.debug('Bad input', {body : req.body});
         return res.boom.badRequest(validation.error);
     }
     
    const missionId = parseInt(req.params.missionId, 10);

    req.transaction.logger.info('Finding mission')
    const mission = await db.Mission.findByPk(missionId, {
        include: [
            'tasks',
            'members'
        ]
    });

    if (!mission) {
        req.transaction.logger.info('Mission not found');
        return res.boom.notFound();
    }

    req.transaction.logger.info('Sending mission');
    return res.status(200).json(mission);
};
