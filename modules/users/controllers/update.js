'use strict';

const db = require.main.require('./modules');

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

module.exports = async function (req, res) {
    if (isNaN(parseInt(req.params.userId, 10))) {
        throw res.boom.badRequest();
    }
    const userId = parseInt(req.params.userId, 10);

    const user = await db.User.findById(userId);

    try {
        await user.update(req.body);

        return res.status(204).json(user);
    } catch (err) {
        if (err instanceof db.Sequelize.ValidationError) {
            throw res.boom.badRequest();
        }

        throw err;
    }
};
