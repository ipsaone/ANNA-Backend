'use strict';

let joi = require('joi');
const bcrypt = require('bcrypt');

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');

const config = require(path.join(root, './src/config/config'));

let schema = joi.object().keys({
    oldPassword: joi.string().required(),
    newPassword1: joi.string().required(),
    newPassword2: joi.string().required(),
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

        // Find the corresponding UserSecret
        let user = await req.transaction.db.User.findByPk(req.transaction.info.userId);
        if(!user) { return res.boom.badRequest("Couldn't find user"); }

        let secret = await user.getSecrets();
        if(!secret) { return res.boom.badRequest("Couldn't find user secrets"); }

        // Compare password to hash
        req.transaction.logger.debug('Comparing hashes');
        const passwordAccepted = await bcrypt.compare(req.body.oldPassword, secret.password);
        if (!passwordAccepted) { return res.boom.badRequest("Old password is wrong"); }

        if(req.body.newPassword1 != req.body.newPassword2) { return res.boom.badRequest("Passwords don't match"); }
        await secret.update({password: req.body.newPassword1});

        return res.status(200).json({});
    };
};
