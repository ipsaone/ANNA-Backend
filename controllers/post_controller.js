'use strict';

const db = require('../models');

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
        .then(posts => {
            res.statusCode = 200;
            res.json(posts);
        })
        .catch(err => {
            res.statusCode = 400;
            res.json({code: 31, message: err.message});
        });
};

exports.show = function (req, res) {
    db.Post.findOne({where: {id: req.params.postId}, include: ['author'], rejectOnEmpty: true})
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
            res.statusCode = 404;
            res.json({code: 31, message: err.message});
        });
};

exports.store = function (req, res) {
    db.Post.create(req.body)
        .then(post => {
            res.statusCode = 201;
            res.json(post);
        })
        .catch(err => {
            res.statusCode = 400;
            res.json({code: 31, message: err.message});
        });
};

exports.update = function (req, res) {
    db.Post.update(req.body, {where: {id: req.params.postId}})
        .then(() => {
            res.statusCode = 204;
            res.json({});
        })
        .catch(err => {
            res.statusCode = 400;
            res.json({code: 31, message: err.message});
        });
};

exports.delete = function (req, res) {
    db.Post.destroy({where: {id: req.params.postId}})
        .then(() => {
            res.statusCode = 204;
            res.json({});
        })
        .catch(err => {
            res.statusCode = 400;
            res.json({code: 31, message: err.message});
        });
};