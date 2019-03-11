'use strict';

const joi = require('joi');
const policy = require('../user_policy');

const schema = joi.object().keys({
    username: joi.string().min(4),
    email: joi.string().min(5),
    password: joi.string().min(6)
});

module.exports = (db) => async function (req, res) {

    // Validate user input
    const validation = joi.validate(req.body, schema);
    if (validation.error) {
        return res.boom.badRequest(validation.error);
    }

    let allowed = policy.filterStore(db, req.session.auth)
    if (!allowed) {
        return res.boom.unauthorized();
    }

    const user = await db.User.create(req.body);

    return res.status(201).json(user);

};
