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

    req.transaction.logger.info('Listing posts');

    let posts = db.Post;

    if (req.query.published) {
        if (req.query.published === 'true') {
            req.transaction.logger.info('Scoping only published posts');
            posts = posts.scope('published');
        } else if (req.query.published === 'false') {
            req.transaction.logger.info('Scoping only drafted posts');
            posts = posts.scope('draft');
        }
    }

    req.transaction.logger.debug('Retrieving posts');
    let postsResponse = await posts.findAll({
        include: ['author'],
        order: [
            [
                'createdAt',
                'DESC'
            ]
        ]
    })

    req.transaction.logger.debug('Filtering posts');
    let postsFiltered = await policy.filterIndex(req.transaction, postsResponse, req.session.auth);

    req.transaction.logger.info('Sending response posts');
    return res.status(200).json(postsFiltered);
};
