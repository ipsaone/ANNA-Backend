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
    const allowed = await policy.filterStore(db, req.session.auth);
    if (!allowed) {
        return res.boom.unauthorized();
    }

    if(typeof req.body.title == 'string') {
        req.body.title = req.body.title.trim();
    } else {
        return res.boom.badRequest('Title must be a string');
    }
    

    const post = await db.Post.create(req.body);


    return res.status(201).json(post);
};
