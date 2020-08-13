'use strict';

let joi = require('joi');
let crypto = require('crypto');

let schema = joi.object().keys({
    secret: joi.string().required()
})


module.exports = function (db) {

    return async (req, res) => {
        // Validate user input
        req.transaction.logger.info('Validating schema');
        const validation = joi.validate(req.body, schema);
        if (validation.error) {
            req.transaction.logger.info('Schema validation failed', {error : validation.error})
            return res.boom.badRequest(validation.error);
        }

        const token = crypto.createHash('sha256').update(req.body.secret).digest('hex');
        let rows = await req.transaction.db.UserSecrets.find({
            where: {
                resetToken: token
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
