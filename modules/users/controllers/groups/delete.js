'use strict';

const policy = require('../../user_policy');

/**
 *
 * Remove user from groups.
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

    if (isNaN(parseInt(req.params.groupId, 10))) {
        throw res.boom.badRequest();
    }
    const groupId = parseInt(req.params.groupId, 10);

    const allowed = await policy.filterDeleteGroup(db, req.body.groupId, userId, req.session.auth);
    if (!allowed) {
        return res.boom.unauthorized();
    }

    const user = await db.User.findById(userId);
    await user.removeGroup(groupId);

    return res.status(204).send();
};
