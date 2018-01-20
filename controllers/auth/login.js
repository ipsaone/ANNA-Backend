'use strict';

const joi = require('joi');
const repo = require.main.require('./repositories/auth');

const schema = joi.object().keys({
    username: joi.string().required(),
    password: joi.string().required()
});

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
module.exports = async (req, res) => {

    // Validate user input
    const validation = joi.validate(req.body, schema);

    if (validation.error) {
        return res.boom.badRequest(validation.error);
    }

    // Login user
    const user = await repo.login(req.body.username, req.body.password);

    if (!user) {
        return res.boom.unauthorized();
    }


    // Save session data
    req.session.auth = user.id;
    req.session.save();

    // Send response
    return res.status(200).json(user);
};
