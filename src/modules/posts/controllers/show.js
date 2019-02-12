'use strict';

const policy = require('../post_policy');

/**
 *
 * Get an existing post.
 *
 * @param {obj} req     - The user request.
 * @param {obj} res     - The response to be sent.
 * @param {obj} handle  - The error handling function.
 *
 * @returns {Object} Promise.
 *
 */

module.exports = (db) => async function (req, res, handle) {
    if (isNaN(parseInt(req.params.postId, 10))) {
        throw res.boom.badRequest('Post ID must be an integer');
    }
    const postId = parseInt(req.params.postId, 10);

    let post = await db.Post.findOne({
        where: {id: postId},
        include: ['author']
    })
        
    if (!post) {
        throw res.boom.notFound();
    }

    post = await policy.filterShow(db, post, req.session.auth);
    return res.status(200).json(post);
};
