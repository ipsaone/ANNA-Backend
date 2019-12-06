'use strict';

/**
 * @api {get} /missions List the missions
 * @apiName list
 * @apiGroup Missions
 * 
 * @apiSuccess {object} missions The missions list
 */

const joi = require('joi');
const schema = joi.object().keys({});

module.exports = (db) => async (req, res) => {

     // Validate user input
     const validation = joi.validate(req.body, schema);
     req.transaction.logger.debug('Validating schema');

     if (validation.error) {
         req.transaction.logger.debug('Bad input', {body : req.body});
         return res.boom.badRequest(validation.error);
     }
    
    req.transaction.logger.info('Finding missions');
    const missions = await db.Mission.findAll({
        attributes: { 
            include: [[db.Sequelize.fn("COUNT", db.Sequelize.col("members.id")), "memberCount"]] 
        },
        include: [
            {model: db.User, as: 'members'}
        ],
        group: [
            'Mission.id'
        ]
    });


    req.transaction.logger.info('Sending response');
    return res.status(200).json(missions);
};
