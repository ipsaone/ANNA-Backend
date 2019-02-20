'use strict';

const joi = require('joi');
const policy = require('../user_policy');

const schema = joi.object().keys({
    username: joi.string().min(4),
    email: joi.string().min(5),
    password: joi.string().min(6)
});

/**
 *
 * Updates an existing user.
 *
 * @param {obj} req     - The user request.
 * @param {obj} res     - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 */

module.exports = (db) => async function (req, res) {
    if (isNaN(parseInt(req.params.userId, 10))) {
        throw res.boom.badRequest('User ID must be an integer');
    }
    const userId = parseInt(req.params.userId, 10);

    // Validate user input
    const validation = joi.validate(req.body, schema);
    if (validation.error) {
        return res.boom.badRequest(validation.error);
    }

    let authorized = policy.filterUpdate(db, req.params.userId, req.session.auth);
    if(!authorized) {
        return res.boom.unauthorized();
    }

    const user = await db.User.findByPk(userId);

    await user.update(req.body);

    return res.status(200).json(user);
};