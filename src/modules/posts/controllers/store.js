'use strict';

/**
 * @api {post} /posts Add a new blog post
 * @apiName store
 * @apiGroup Posts
 * 
 * @apiParam {string} title The post's title
 * @apiParam {string} markdown The post's contents as markdown
 * @apiParam {integer} authorId The post's author ID
 * @apiParam {boolean} [published] Whether the post is published or a draft
 * @apiParam {boolean} [pinned] Whether the post is pinned to the top of the list
 * 
 * @apiSuccess post The blog post's information
 */


const policy = require('../post_policy');
const joi = require('joi');

const schema = joi.object().keys({
    title : joi.string().trim(true).min(10).required(),
    markdown : joi.string().trim(true).min(10).required(),
    authorId : joi.number().required(),
    published : joi.boolean().optional(),
    pinned: joi.boolean().optional()
});

module.exports = (db) => async function (req, res) {
    req.transaction.logger.info('Post store controller invoked');

    // Validate user input
    req.transaction.logger.info('Validating input');
    const validation = joi.validate(req.body, schema);
    if (validation.error) {
        req.transaction.logger.info('Input denied by validator');
        return res.boom.badRequest(validation.error);
    }

    if(typeof req.body.title == 'string') {
        req.body.title = req.body.title.trim();
    } else {
        req.transaction.logger.info('Post title isn\'t a string, request denied');
        return res.boom.badRequest('Title must be a string');
    }
    
    req.transaction.logger.info('Creating post');
    const post = await db.Post.create(req.body);

    req.transaction.logger.info('Sending response');
    return res.status(201).json(post);
};
