'use strict';

const db = require.main.require('./models');

/**
 *
 * Get all user's posts.
 * Can get altered with scopes.
 *
 * @example GET /users/:userId/posts?published=true  -> return all published posts
 * @example GET /users/:userId/posts?published=false -> return all drafted posts
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

    let posts = db.Post;

    if (req.query.published) {
        if (req.query.published === 'true') {
            posts = posts.scope('published');
        } else if (req.query.published === 'false') {
            posts = posts.scope('draft');
        }
    }

    return posts.findAll({where: {authorId: userId}})
        .then((response) => res.status(200).json(response))
        .catch((err) => handle(err));
};
