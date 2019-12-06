'use strict';

let joi = require('joi');
const bcrypt = require('bcrypt');

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');

const config = require(path.join(root, './src/config/config'));

let schema = joi.object().keys({
    token: joi.string().required(),
    password: joi.string().min(6).required()
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

        // Find the corresponding UserSecret
        let secret;
        let rows = await req.transaction.db.UserSecrets.find({
            where: {
                resetToken: req.body.token
            }
        });
        if (rows == 1) {
            secret = rows[0];
        } else if (rows == 0) {
            return res.boom.badRequest("Token not found");
        } else {
            return res.boom.badImplementation("Error while retrieving tokens");
        }

        let hash = await bcrypt.hash(req.body.password, config.password.salt);
        await secret.update({password: hash});

        return res.status(204);

        
    };
};
