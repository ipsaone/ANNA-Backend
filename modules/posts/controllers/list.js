'use strict';

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');
const db = require(path.join(root, './modules'));
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

module.exports = function (req, res, handle) {
    let posts = db.Post;

    if (req.query.published) {
        if (req.query.published === 'true') {
            posts = posts.scope('published');
        } else if (req.query.published === 'false') {
            posts = posts.scope('draft');
        }
    }

    return posts.findAll({
        include: ['author'],
        order: [
            [
                'createdAt',
                'DESC'
            ]
        ]
    })
        .then((postsResponse) => policy.filterIndex(postsResponse, req.session.auth))
        .then((postsFiltered) => res.status(200).json(postsFiltered))
        .catch((err) => handle(err));
};
