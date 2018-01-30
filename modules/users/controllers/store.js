'use strict';

const db = require.main.require('./modules');

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

module.exports = async function (req, res) {

    try {
        const user = await db.User.create(req.body);


        return res.status(201).json(user);
    } catch (err) {
        if (err instanceof db.Sequelize.ValidationError) {
            throw res.boom.badRequest(err);
        }
        throw err;
    }
};
