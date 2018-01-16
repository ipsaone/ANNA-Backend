'use strict';

const db = require('../../models');
const bcrypt = require('bcrypt');
const joi = require('joi');

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
 * @param {obj} handle   - The error handling function.
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

    // Find user in database
    const user = await db.User.findOne({
        where: {'username': req.body.username},
        include: [
            'groups',
            'events',
            'participatingMissions'
        ]
    });

    // Check user was found
    if (!user) {
        return res.boom.notFound('Bad username');
    }

    // Compare password to hash
    const passwordAccepted = await bcrypt.compare(req.body.password, user.password);

    if (!passwordAccepted) {
        return res.boom.unauthorized('Bad password');
    }

    // Save session data
    req.session.auth = user.id;
    req.session.save();

    // Send response
    return res.status(200).json(user);
};
