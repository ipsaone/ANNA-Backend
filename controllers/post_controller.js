'use strict';

const db = require('../models');
const policy = require('../policies/post_policy');


/**
 *
 * Get all existing posts
 * Can get altered with scopes to filter publishing.
 *
 * @example GET /posts?published=true  -> return all published posts
 * @example GET /posts?published=false -> return all drafter posts
 *
 * @param {obj} req     - the user request
 * @param {obj} res     - the response to be sent
 * @param {obj} handle  - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.index = function (req, res, handle) {
    let posts = db.Post;

    if (req.query.published) {
        if (req.query.published === 'true') {
            posts = posts.scope('published');
        } else if (req.query.published === 'false') {
            posts = posts.scope('draft');
        }
    }

    return posts.findAll({
        include: ['author'],
        order: [
            [
                'createdAt',
                'DESC'
            ]
        ]
    })
        .then((postsResponse) => policy.filterIndex(req, res, postsResponse))
        .then((postsFiltered) => res.status(200).json(postsFiltered))
        .catch((err) => handle(err));
};

/**
 *
 * Get an existing post.
 *
 * @param {obj} req     the user request.
 * @param {obj} res     the response to be sent
 * @param {obj} handle  the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.show = function (req, res, handle) {
    if (typeof req.params.postId !== 'number') {

        throw res.boom.badRequest();
    }

    return db.Post.findOne({
        where: {id: req.params.postId},
        include: ['author']
    })
        .then((post) => {
            if (!post) {
                throw res.boom.notFound();
            }

            return post;
        })
        .then((post) => policy.filterShow(req, post))
        .then((post) => res.status(200).json(post))
        .catch((err) => handle(err));
};

/**
 *
 * Create and store a new post.
 *
 * @param {Object} req - the user request
 * @param {Object} res - the response to be sent
 * @param {Object} handle - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.store = function (req, res, handle) {
    return policy.filterStore(req, res)
        .then(() => db.Post.create(req.body))
        .then((post) => res.status(201).json(post))
        .catch(db.Sequelize.ValidationError, () => res.boom.badRequest())
        .catch((err) => handle(err));
};

/**
 *
 * Updates an existing post.
 *
 * @param {obj} req     the user request
 * @param {obj} res     the response to be sent
 * @param {obj} handle  - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.update = function (req, res, handle) {
    if (typeof req.params.postId !== 'number') {

        throw res.boom.badRequest();
    }

    return policy.filterUpdate(req, res)
        .then(() => db.Post.update(req.body, {where: {id: req.params.postId}}))
        .then((post) => res.status(200).json(post))
        .catch(db.Sequelize.ValidationError, () => res.boom.badRequest())
        .catch((err) => handle(err));
};

/**
 *
 * Deletes an existing post.
 *
 * @param {obj} req     the user request
 * @param {obj} res     the response to be sent
 * @param {obj} handle  - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.delete = function (req, res, handle) {
    if (typeof req.params.postId !== 'number') {

        throw res.boom.badRequest();
    }

    return policy.filterDelete(req, res)
        .then(() => db.Post.destroy({where: {id: req.params.postId}}))
        .then(() => res.status(204).json({}))
        .catch(db.Sequelize.ValidationError, () => res.boom.badRequest())
        .catch((err) => handle(err));
};
