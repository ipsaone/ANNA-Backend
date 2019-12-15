'use strict';

let joi = require('@hapi/joi');

let schema = joi.object().keys({
    token: joi.string().required()
})


module.exports = function (db) {

    return async (req, res) => {
        // Validate user input
        req.transaction.logger.info('Validating schema');
        const validation = schema.validate(req.body);
        if (validation.error) {
            req.transaction.logger.info('Schema validation failed', {error : validation.error})
            return res.boom.badRequest(validation.error);
        }

        let rows = await req.transaction.db.UserSecrets.find({
            where: {
                resetToken: req.body.token
            }
        });
        if (rows == 1) {
            return res.status(200).json({found: true});
        } else if (rows == 0) {
            return res.status(200).json({found: false})
        } else {
            return res.boom.badImplementation("Error while retrieving tokens");
        }
        
    };
};
