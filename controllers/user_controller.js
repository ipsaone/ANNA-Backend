'use strict';

const db = require('../models');

/**
 * List all users.
 * @param req
 * @param res
 */
exports.index = function (req, res) {
    db.User.findAll()
        .then(users => {
            res.statusCode = 200;
            res.json(users);
        })
        .catch(err => {
            res.statusCode = 400;
            res.json({code: 31, message: err.message});
        });
};


/**
 * Return an user with its groups.
 * @param req
 * @param res
 */
exports.show = function (req, res) {
    db.User.findOne({where: {id: req.params.userId}, include: ['groups'], rejectOnEmpty: true})
        .then(user => {
            res.statusCode = 200;
            res.json(user);
        })
        .catch(err => {
            res.statusCode = 404;
            res.json({code: 31, message: err.message});
        });
};


/**
 * Store a new user. The body must be :
 * {
 *      "username": string,
 *      "password": string,
 *      "email": string
 * }
 *
 * @param req
 * @param res
 */
exports.store = function (req, res) {
    db.User.create(req.body)
        .then(user => {
            res.statusCode = 201;
            res.json(user);
        })
        .catch(err => {
            res.statusCode = 400;
            res.json({code: 31, message: err.message});
        });
};


/**
 * Update an user. The body must be :
 * {
 *      "username": string - If you want to update just the username
 * }
 *
 * @param req
 * @param res
 */
exports.update = function (req, res) {
    db.User.update(req.body, {where: {id: req.params.userId}})
        .then(() => {
            res.statusCode = 204;
            res.json({});
        })
        .catch(err => {
            res.statusCode = 400;
            res.json({code: 31, message: err.message});
        });
};


/**
 * Delete an user.
 * @param req
 * @param res
 */
exports.delete = function (req, res) {
    db.User.destroy({where: {id: req.params.userId}})
        .then(() => {
            res.statusCode = 204;
            res.json({});
        })
        .catch(err => {
            res.statusCode = 400;
            res.json({code: 31, message: err.message});
        });
};

/**
 * Return all posts of an user.
 * @param req
 * @param res
 */
exports.posts = function (req, res) {
    // GET /users/:userId/posts                 -> return all posts
    // GET /users/:userId/posts?published=true  -> return all published posts
    // GET /users/:userId/posts?published=false -> return all drafted posts
    let posts = db.Post;

    if (req.query.published) {
        if (req.query.published === 'true') posts = posts.scope('published');
        else if (req.query.published === 'false') posts = posts.scope('draft');
    }

    posts.findAll({where: {authorId: req.params.userId}})
        .then(posts => {
            res.statusCode = 200;
            res.json(posts);
        })
        .catch(err => {
            res.statusCode = 400;
            res.json({code: 31, message: err.message});
        });
};


/**
 * Return all groups of an user.
 * @param req
 * @param res
 */
exports.get_groups = function (req, res) {
    db.User.findOne({where: {id: req.params.userId}, include: ['groups']})
        .then(user => {
            res.statusCode = 200;
            res.json(user.groups);
        })
        .catch(err => {
            res.statusCode = 400;
            res.json({code: 31, message: err.message});
        });
};

/**
 * Add groups to an user. The body must be :
 * {
 *      "groupsId": [int, int, int, int]
 * }
 *
 * If you want to add only one group :
 * {
 *      "groupsId": [int]
 * }
 *
 * @param req
 * @param res
 */
exports.add_groups = function (req, res) {
    db.User.findById(req.params.userId)
        .then(user => {
            user.addGroups(req.body.groupsId)
                .then(() => {
                    res.statusCode = 204;
                    res.json({});
                })
                .catch(err => { // If a group doesn't exist
                    res.statusCode = 400;
                    res.json({code: 31, message: err.message});
                });
        })
        .catch(err => {
            res.statusCode = 400;
            res.json({code: 31, message: err.message});
        });
};

/**
 * Delete groups from an user. The body must be:
 * {
 *      "groupsId": [int, int, int, int]
 * }
 *
 * If you want to delete only one group :
 * {
 *      "groupsId": [int]
 * }
 * @param req
 * @param res
 */
exports.delete_groups = function (req, res) {
    db.User.findById(req.params.userId)
        .then(user => {
            user.removeGroups(req.body.groupsId)
                .then(() => {
                    res.statusCode = 204;
                    res.json({});
                })
                .catch(err => { // If a group doesn't exist
                    res.statusCode = 400;
                    res.json({code: 31, message: err.message});
                });
        })
        .catch(err => {
            res.statusCode = 400;
            res.json({code: 31, message: err.message});
        });
};