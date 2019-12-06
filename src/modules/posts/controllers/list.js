'use strict';

/**
 * @api {get} /posts/ List blog posts
 * @apiName list
 * @apiGroup Posts
 * 
 * @apiSuccess posts The blog posts list
 */

const policy = require('../post_policy');
const joi = require('joi');
const schema = joi.object().keys({});


module.exports = (db) => async function (req, res) {

    req.transaction.logger.info('Listing posts');

    // Validate user input
    const validation = joi.validate(req.body, schema);
    req.transaction.logger.debug('Validating schema');

    if (validation.error) {
        req.transaction.logger.debug('Bad input', {body : req.body});
        return res.boom.badRequest(validation.error);
    }

    let posts = db.Post;

    if (req.query.published) {
        if (req.query.published === 'true') {
            req.transaction.logger.info('Scoping only published posts');
            posts = posts.scope('published');
        } else if (req.query.published === 'false') {
            req.transaction.logger.info('Scoping only drafted posts');
            posts = posts.scope('draft');
        }
    }

    req.transaction.logger.debug('Retrieving posts');
    let postsResponse = await posts.findAll({
        include: ['author'],
        order: [
            [
                'createdAt',
                'DESC'
            ]
        ]
    })
    req.transaction.logger.debug('Posts retrieved', {postsResponse});

    req.transaction.logger.debug('Filtering posts');
    let postsFiltered = await policy.filterIndex(req.transaction, postsResponse, req.session.auth);

    req.transaction.logger.info('Sending response posts');
    req.transaction.logger.debug('Posts response', {postsFiltered});
    return res.status(200).json(postsFiltered);
};
