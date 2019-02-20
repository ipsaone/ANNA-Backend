'use strict';

const joi = require('joi');
const repo = require('./repository');
const winston = require('winston');

const schema = joi.object().keys({
    username: joi.string().required(),
    password: joi.string().required()
});

/**
 * @param {db} obj
 */

module.exports = function (db) {

    /**
     *
     * Logs in a user.
     *
     * @param {obj} req      - The user request.
     * @param {obj} res      - The response to be sent.
     *
     * @returns {Object} Promise.
     *
     */
    return async (req, res) => {

        req.transaction.logger.info('Login controller invoked');

        // Validate user input
        const validation = joi.validate(req.body, schema);
        req.transaction.logger.debug('Validating schema');

        if (validation.error) {
            req.transaction.logger.debug('Bad input', {body : req.body});
            return res.boom.badRequest(validation.error);
        }

        // Login user
        req.transaction.logger.info('Logging in', {username: req.body.username});
        const user = await repo.login(db, req.body.username, req.body.password);

        if (!user) {
            req.transaction.logger.debug('Login failed');
            return res.boom.unauthorized();
        }


        // Save session data
        req.transaction.logger.info('Login successful', {userId : user.id});
        req.session.auth = user.id;
        req.session.save();

        // Send response
        return res.status(200).json(user);
    };
};
