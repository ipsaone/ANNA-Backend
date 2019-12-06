'use strict';

const policy = require('../post_policy');
const joi = require('joi');
const schema = joi.object().keys({});


module.exports = (db) => async function (req, res) {
    // Validate user input
    const validation = joi.validate(req.body, schema);
    req.transaction.logger.debug('Validating schema');

    if (validation.error) {
        req.transaction.logger.debug('Bad input', {body : req.body});
        return res.boom.badRequest(validation.error);
    }

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
