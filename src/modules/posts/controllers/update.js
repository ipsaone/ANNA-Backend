'use strict';

/**
 * @api {put} /posts/:postId Update a blog post
 * @apiName update
 * @apiGroup Posts
 * 
 * @apiParam {string} [title] The post's title
 * @apiParam {string} [markdown] The post's contents as markdown
 * @apiParam {integer} [authorId] The post's author ID
 * @apiParam {boolean} [published] Whether the post is published or a draft
 * @apiParam {boolean} [pinned] Whether the post is pinned to the top of the list
 * 
 * @apiSuccess post The blog post's information
 */

const policy = require('../post_policy');
const joi = require('joi');

const schema = joi.object().keys({
    title : joi.string().trim(true).min(10).optional(),
    markdown : joi.string().trim(true).min(10).optional(),
    authorId : joi.number().optional(),
    published : joi.boolean().optional(),
    pinned: joi.boolean().optional()
});


module.exports = (db) => async function (req, res, handle) {
    const postId = parseInt(req.params.postId, 10);
    req.transaction.logger.info('Post update controller invoked', {postId});

    // Validate user input
    req.transaction.logger.info('Validating input');
    const validation = joi.validate(req.body, schema);
    if (validation.error) {
        req.transaction.logger.info('Input denied by validator');
        return res.boom.badRequest(validation.error);
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
