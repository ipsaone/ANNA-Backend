'use strict';

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');
const db = require(path.join(root, './modules'));
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

module.exports = async function (req, res) {
    if (isNaN(parseInt(req.params.userId, 10))) {
        throw res.boom.badRequest();
    }
    const userId = parseInt(req.params.userId, 10);

    const groups = await policy.filterDeleteGroups(req.body.groupsId, userId, req.session.auth);
    const user = await db.User.findById(userId);

    await user.removeGroups(groups);

    return res.status(204).send();
};
