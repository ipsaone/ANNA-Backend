'use strict';


/**
 *
 * Get all existing users.
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 */

module.exports = (db) => async function (req, res) {
    const users = await db.User.findAll();


    return res.status(200).json(users);
};
