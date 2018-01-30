'use strict';

const db = require.main.require('./modules');
const policy = require('../post_policy');

/**
 *
 * Create and store a new post.
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 * @param {Object} handle - The error handling function.
 *
 * @returns {Object} Promise.
 *
 */

module.exports = function (req, res, handle) {
    return policy.filterStore(req.session.auth)
        .then(() => db.Post.create(req.body))
        .then((post) => res.status(201).json(post))
        .catch((err) => {
            if (err instanceof db.Sequelize.ValidationError) {
                res.boom.badRequest(err);
            }
            throw err;
        })
        .catch((err) => handle(err));
};
