'use strict';

const policy = require('../post_policy');


module.exports = (db) => async function (req, res) {
    const postId = parseInt(req.params.postId, 10);
    req.transaction.logger.info('Post deletion controller invoked', {postId});

    req.transaction.logger.debug('Filtering deletion');
    let authorized = await policy.filterDelete(req.transaction, req.session.auth);
    if(!authorized) {
        req.transaction.logger.info('Deletion denied');
        return res.boom.unauthorized();
    }

    req.transaction.logger.info('Deleting post');
    db.Post.destroy({where: {id: postId}});

    req.transaction.logger.info('Sending response');
    return res.status(204).json({});
};
