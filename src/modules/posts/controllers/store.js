'use strict';

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

module.exports = (db) => async function (req, res) {
    req.transaction.logger.info('Post store controller invoked');

    req.transaction.logger.info('Checking store policies');
    const allowed = await policy.filterStore(db, req.session.auth);
    if (!allowed) {
        req.transaction.logger.info('Post store denied');
        return res.boom.unauthorized();
    }

    if(typeof req.body.title == 'string') {
        req.body.title = req.body.title.trim();
    } else {
        req.transaction.logger.info('Post title isn\'t a string, request denied');
        return res.boom.badRequest('Title must be a string');
    }
    
    req.transaction.logger.info('Creating post');
    const post = await db.Post.create(req.body);

    req.transaction.logger.info('Sending response');
    return res.status(201).json(post);
};