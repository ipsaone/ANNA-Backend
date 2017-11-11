'use strict';

const db = require('../models');
const boom = require('boom');

/**
 * List all users.
 * @param req
 * @param res
 */
exports.index = function (req, res, handle) {
    db.User.findAll()
        .then(users => res.status(200).json(users))
        .catch(err => handle(err));
};


/**
 * Return an user with its groups.
 * @param req
 * @param res
 */
exports.show = function (req, res, handle) {
    db.User.findOne({where: {id: req.params.userId}, include: ['groups']})
        .then(user => {
            if(!user) { res.boom.badRequest(); }
            else {
                res.status(200).json(user);
            }
        })
        .catch(err => handle(err));
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
exports.store = function (req, res, handle) {
    db.User.create(req.body)
        .then(user => res.status(201).json(user))
        .catch(err => handle(err));
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
exports.update = function (req, res, handle) {
    db.User.findOne({where: {id: req.params.userId}})
        .then(record => record.update(req.body))
        .then(() => res.status(204))
        .catch(err => handle(err));
};


/**
 * Delete an user.
 * @param req
 * @param res
 */
exports.delete = function (req, res, handle) {
    db.User.destroy({where: {id: req.params.userId}})
        .then(() => res.statusCode(204))
        .catch(err => handle(err));
};

/**
 * Return all posts of an user.
 * @param req
 * @param res
 */
exports.posts = function (req, res, handle) {
    // GET /users/:userId/posts                 -> return all posts
    // GET /users/:userId/posts?published=true  -> return all published posts
    // GET /users/:userId/posts?published=false -> return all drafted posts
    let posts = db.Post;

    if (req.query.published) {
        if (req.query.published === 'true') posts = posts.scope('published');
        else if (req.query.published === 'false') posts = posts.scope('draft');
    }

    posts.findAll({where: {authorId: req.params.userId}})
        .then(posts => res.status(200).json(posts))
        .catch(err => handle(err));
};


/**
 * Return all groups of an user.
 * @param req
 * @param res
 */
exports.get_groups = function (req, res) {
    db.User.findOne({where: {id: req.params.userId}, include: ['groups']})
        .then(user => res.status(200).json(user.groups))
        .catch(err => handle(err));
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
        .then(user => user.addGroups(req.body.groupsId))
        .then(() => res.status(204))
        .catch(err => handle(err));
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
        .then(user => user.removeGroups(req.body.groupsId))
        .then(() => res.status(204))
        .catch(err => handle(err));
};
