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
    const postId = parseInt(req.params.postId, 10);
    req.transaction.logger.info('Post deletion controller invoked', {postId});

    req.transaction.logger.debug('Filtering deletion');
    let authorized = await policy.filterDelete(db, req.session.auth);
    if(!authorized) {
        req.transaction.logger.info('Deletion denied');
        return res.boom.unauthorized();
    }

    req.transaction.logger.info('Deleting post');
    db.Post.destroy({where: {id: postId}});

    req.transaction.logger.info('Sending response');
    return res.status(204).json({});
};
