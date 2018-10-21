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

    if (isNaN(parseInt(req.params.groupId, 10))) {
        throw res.boom.badRequest();
    }
    const groupId = parseInt(req.params.groupId, 10);



    const allowedP = policy.filterAddGroup(db, groupId, userId, req.session.auth);

    const user = await db.User.findByPk(userId);

    if (!user) {
        return res.boom.badRequest();
    }

    const allowed = await allowedP;

    if (!allowed) {
        return res.boom.unauthorized();
    }

    await user.addGroup(groupId);
    await user.save();

    return res.status(204).send();
};
