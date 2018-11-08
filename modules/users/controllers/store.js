'use strict';

const joi = require('joi');

const schema = joi.object().keys({
    name: joi.string().min(4),
    email: joi.string().min(5),
    password: joi.string().min(6)
});

/**
 *
 * Create a store a new user.
 *
 * @param {obj} req     - The user request.
 * @param {obj} res     - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 */

module.exports = (db) => async function (req, res) {

    // Validate user input
    const validation = joi.validate(req.body, schema);
    if (validation.error) {
        return res.boom.badRequest(validation.error);
    }

    const user = await db.User.create(req.body);

    return res.status(201).json(user);

};
