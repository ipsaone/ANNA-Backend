'use strict';

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');
const db = require(path.join(root, './modules'));
// Const policy = require('../../user_policy');

/**
 *
 * Get all user's groups.
 *
 * @param {obj} req     - The user request.
 * @param {obj} res     - The response to be sent.
 * @param {obj} handle  - The error handler.
 *
 * @returns {Object} Promise.
 *
 */

module.exports = function (req, res, handle) {
    if (isNaN(parseInt(req.params.userId, 10))) {
        throw res.boom.badRequest();
    }
    const userId = parseInt(req.params.userId, 10);

    return db.User.findOne({
        where: {id: userId},
        include: ['groups']
    })
        .then((user) => {
            if (user) {
                return res.status(200).json(user.groups);
            }
            throw res.boom.badRequest();

        })
        .catch((err) => handle(err));
};
