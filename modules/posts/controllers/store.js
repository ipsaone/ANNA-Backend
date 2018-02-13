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

    const post = await db.Post.create(req.body);


    return res.status(201).json(post);
};
