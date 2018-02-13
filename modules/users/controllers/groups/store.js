'use strict';

const policy = require('../../user_policy');

/**
 *
 * Add user to group.
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 */

module.exports = (db) => async function (req, res) {
    if (isNaN(parseInt(req.params.userId, 10))) {
        throw res.boom.badRequest();
    }
    const userId = parseInt(req.params.userId, 10);

    const groupsP = policy.filterAddGroups(db, req.body.groupsId, req.session.auth);

    const user = await db.User.findById(userId);

    if (!user) {
        return res.boom.badRequest();
    }

    const groups = await groupsP;

    if (!groups || groups.length === 0) {
        return res.boom.unauthorized();
    }

    await user.addGroups(groups);
    await user.save();

    return res.status(204).send();
};
