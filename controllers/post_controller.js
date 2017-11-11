'use strict';

const db = require('../models');
const policy = require('../policies/post_policy');
const boom = require('boom');

exports.index = function (req, res, handle) {
    // GET /posts                 -> return all posts
    // GET /posts?published=true  -> return all published posts
    // GET /posts?published=false -> return all drafted posts
    let posts = db.Post;

    if (req.query.published) {
        if (req.query.published === 'true') posts = posts.scope('published');
        else if (req.query.published === 'false') posts = posts.scope('draft');
    }

    posts.findAll({include: ['author'], order: [['createdAt', 'DESC']]})
        .then(posts => policy.filterIndex(req, res, posts))
        .then(posts => res.status(200).json(posts));
};

exports.show = function (req, res) {
    db.Post.findOne({where: {id: req.params.postId}, include: ['author'], rejectOnEmpty: true})
        .then(post => policy.filterShow(req, res, post))
        .then(post => {
            if (!post) { res.boom.notFound(); }

            else {
                res.status(200).json(post);
            }
        })
};

exports.store = function (req, res, handle) {
    policy.filterStore(req, res)
        .then(() => db.Post.create(req.body))
        .then(post => res.status(201).json(post))
};

exports.update = function (req, res, handle) {
    policy.filterUpdate(req, res)
    .then(() => db.Post.update(req.body, {where: {id: req.params.postId}}))
    .then(() => res.status(204))
    .catch(err => handle(err));
};

exports.delete = function (req, res, handle) {
    policy.filterDelete(req, res)
    .then(() => db.Post.destroy({where: {id: req.params.postId}}))
    .then(() => res.status(204))
    .catch(err => handle(err));
};
