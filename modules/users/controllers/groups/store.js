'use strict';

const db = require.main.require('./modules');
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

module.exports = async function (req, res) {
    if (isNaN(parseInt(req.params.userId, 10))) {
        throw res.boom.badRequest();
    }
    const userId = parseInt(req.params.userId, 10);

    const groups = await policy.filterAddGroups(req.body.groupsId, req.session.auth);
    const user = await db.User.findById(userId);

    if (!user) {
        throw res.boom.badRequest();
    }


    await user.addGroups(groups);

    return res.status(204).send();
};
