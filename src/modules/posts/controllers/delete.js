'use strict';

/**
 * @api {delete} /posts/:postId Delete a blog post
 * @apiName delete
 * @apiGroup Posts
 */

const policy = require('../post_policy');
const joi = require('joi');
const schema = joi.object().keys({});


module.exports = (db) => async function (req, res) {
    const postId = parseInt(req.params.postId, 10);
    req.transaction.logger.info('Post deletion controller invoked', {postId});

    // Validate user input
    const validation = joi.validate(req.body, schema);
    req.transaction.logger.debug('Validating schema');

    if (validation.error) {
        req.transaction.logger.debug('Bad input', {body : req.body});
        return res.boom.badRequest(validation.error);
    }

    req.transaction.logger.info('Deleting post');
    db.Post.destroy({where: {id: postId}});

    req.transaction.logger.info('Sending response');
    return res.status(204).json({});
};
