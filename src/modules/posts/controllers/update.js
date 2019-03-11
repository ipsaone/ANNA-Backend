'use strict';

const policy = require('../post_policy');



module.exports = (db) => async function (req, res, handle) {
    const postId = parseInt(req.params.postId, 10);
    req.transaction.logger.info('Post update controller invoked', {postId});

    req.transaction.logger.info('Checking policies');
    let authorized = await policy.filterUpdate(db, req.session.auth);
    if (!authorized) {
        req.transaction.logger.info('Policies check failed, request denied');
        return res.boom.unauthorized('You must be an author to edit a post');
    }
    
    req.transaction.logger.info('Updating post');
    let post = await db.Post.update(req.body, {where: {id: postId}});

    req.transaction.logger.info('Sending response');
    if (post.length === 1) {
        return res.status(200).json(post[0]);
    } else if (post.length === 0) {
        throw res.boom.notFound();
    } else {
        console.log(`Multiple posts edited ! (${post.length})`);
        throw res.boom.badImplementation();
    }
};
