'use strict';

const db = require('../models');
const policy = require('../policies/post_policy');
const boom = require('boom')

exports.index = function (req, res) {
    // GET /posts                 -> return all posts
    // GET /posts?published=true  -> return all published posts
    // GET /posts?published=false -> return all drafted posts
    let posts = db.Post;

    if (req.query.published) {
        if (req.query.published === 'true') posts = posts.scope('published');
        else if (req.query.published === 'false') posts = posts.scope('draft');
    }

    posts.findAll({include: ['author'], order: [['createdAt', 'DESC']]})
        .then(posts => policy.filterIndex(req, posts))
        .then(posts => {
            res.statusCode = 200;
            res.json(posts);
        })
        .catch(err => {
            console.log(err);
            if(!boom.isBoom(err)) {
                res.statusCode = 500;
                res.json({code: 31, message: err.message});
            } else {
                res.send(err);
            }
        });
};

exports.show = function (req, res) {
    db.Post.findOne({where: {id: req.params.postId}, include: ['author'], rejectOnEmpty: true})
        .then(post => policy.filterShow(req, post))
        .then(post => {
            if (!post) {
                res.statusCode = 404;
                res.json({code: 23});
            }
            else {
                res.statusCode = 200;
                res.json(post);
            }
        })
        .catch(err => {
            if(!boom.isBoom(err)) {
                res.statusCode = 500;
                res.json({code: 31, message: err.message});
            } else {
                res.send(err);
            }
        });
};

exports.store = function (req, res) {
    policy.filterStore(req, res)
        .then(() => db.Post.create(req.body))
        .then(post => {
            res.statusCode = 201;
            res.json(post);
        })
        .catch(err => {
            if(!boom.isBoom(err)) {
                res.statusCode = 500;
                res.json({code: 31, message: err.message});
            } else {
                res.send(err);
            }
        });
};

exports.update = function (req, res) {
    policy.filterUpdate(req)
    .then(() => db.Post.update(req.body, {where: {id: req.params.postId}}))
    .then(() => {
        res.statusCode = 204;
        res.json({});
    })
    .catch(err => {
        if(!boom.isBoom(err)) {
            res.statusCode = 500;
            res.json({code: 31, message: err.message});
        } else {
            res.send(err);
        }
    });
};

exports.delete = function (req, res) {
    policy.filterDelete(req)
    .then(() => db.Post.destroy({where: {id: req.params.postId}}))
    .then(() => {
        res.statusCode = 204;
        res.json({});
    })
    .catch(err => {
        if(!boom.isBoom(err)) {
            res.statusCode = 500;
            res.json({code: 31, message: err.message});
        } else {
            res.send(err);
        }
    });
};
