'use strict';

const policy = require('../post_policy');

/**
 *
 * Get all existing posts.
 * Can get altered with scopes to filter publishing.
 *
 * @example GET /posts?published=true  -> return all published posts
 * @example GET /posts?published=false -> return all drafter posts
 *
 * @param {obj} req     - The user request.
 * @param {obj} res     - The response to be sent.
 * @param {obj} handle  - The error handling function.
 *
 * @returns {Object} Promise.
 *
 */

module.exports = (db) => async function (req, res) {
    let posts = db.Post;

    if (req.query.published) {
        if (req.query.published === 'true') {
            posts = posts.scope('published');
        } else if (req.query.published === 'false') {
            posts = posts.scope('draft');
        }
    }

    let postsResponse = await posts.findAll({
        include: ['author'],
        order: [
            [
                'createdAt',
                'DESC'
            ]
        ]
    })
    let postsFiltered = await policy.filterIndex(db, postsResponse, req.session.auth);
    return res.status(200).json(postsFiltered);
};
