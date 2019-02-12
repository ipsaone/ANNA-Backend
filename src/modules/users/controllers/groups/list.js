'use strict';

// Const policy = require('../../user_policy');

/**
 *
 * Get all user's groups.
 *
 * @param {obj} req     - The user request.
 * @param {obj} res     - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 */

module.exports = (db) => async function (req, res) {
    if (isNaN(parseInt(req.params.userId, 10))) {
        return res.boom.badRequest('User ID must be an integer');
    }
    const userId = parseInt(req.params.userId, 10);

    let user = await db.User.findOne({
        where: {id: userId},
        include: ['groups']
    });

    if(!user) {
        return res.boom.badRequest('User not found');
    }
    
    return res.status(200).json(user.groups);
    
};
