'use strict';

const policy = require('../post_policy');

/**
 *
 * Deletes an existing post.
 *
 * @param {obj} req     - The user request.
 * @param {obj} res     - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 */

module.exports = (db) => async function (req, res) {
    if (isNaN(parseInt(req.params.postId, 10))) {
        throw res.boom.badRequest('Post ID must be an integer');
    }
    const postId = parseInt(req.params.postId, 10);

    let authorized = await policy.filterDelete(db, req.session.auth);
    if(!authorized) {
        return res.boom.unauthorized();
    }
    
    db.Post.destroy({where: {id: postId}})
    return res.status(204).json({});
};
