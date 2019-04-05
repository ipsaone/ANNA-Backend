'use strict';

const policy = require('../post_policy');

module.exports = (db) => async function (req, res, handle) {
    const postId = parseInt(req.params.postId, 10);
    req.transaction.logger.info('Post details controller invoked', {postId});

    req.transaction.logger.info('Retrieving post');
    let post = await db.Post.findOne({
        where: {id: postId},
        include: ['author']
    })
        
    if (!post) {
        req.transaction.logger.info('Post not found');
        throw res.boom.notFound();
    }

    req.transaction.logger.info('Checking post details policy');
    post = await policy.filterShow(req.transaction, post, req.session.auth);

    req.transaction.logger.info('Sending response');
    return res.status(200).json(post);
};
