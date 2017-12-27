'use strict';

const db = require('../models');
const policy = require('../policies/user_policy');

/**
 *
 * Get all existing users.
 *
 * @param {Object} req - the user request
 * @param {Object} res - the response to be sent
 * @param {Object} handle - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.index = function (req, res, handle) {
    return db.User.findAll()
        .then((users) => policy.filterIndex(users, req.session.auth))
        .then((users) => res.status(200).json(users))
        .catch((err) => handle(err));
};


/**
 *
 * Get a single user.
 *
 * @param {obj} req     - the user request
 * @param {obj} res     - the response to be sent
 * @param {obj} handle  - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.show = function (req, res, handle) {
    if (isNaN(parseInt(req.params.userId, 10))) {
        throw res.boom.badRequest();
    }
    const userId = parseInt(req.params.userId, 10);

    return db.User.findOne({
        where: {id: userId},
        include: ['groups']
    })
        .then((user) => policy.filterShow(user, req.session.auth))
        .then((user) => {
            if (user) {
                return res.status(200).json(user);
            }
            throw res.boom.notFound();

        })
        .catch((err) => handle(err));
};

/**
 *
 * Create a store a new user.
 *
 * @param {obj} req     - the user request.
 * @param {obj} res     - the response to be sent
 * @param {obj} handle  - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.store = function (req, res, handle) {
    return db.User.create(req.body)
        .then((user) => res.status(201).json(user))
        .catch((err) => {
            if (err instanceof db.Sequelize.ValidationError) {
                res.boom.badRequest(err);
            }
            throw err;
        })
        .catch((err) => handle(err));
};

/**
 *
 * Updates an existing user.
 *
 * @param {obj} req     - The user request.
 * @param {obj} res     the response to be sent.
 * @param {obj} handle  the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.update = function (req, res, handle) {
    if (isNaN(parseInt(req.params.userId, 10))) {
        throw res.boom.badRequest();
    }
    const userId = parseInt(req.params.userId, 10);

    return db.User.findOne({where: {id: userId}})
        .then((record) => record.update(req.body))
        .then(() => res.status(204).json({}))
        .catch(db.Sequelize.ValidationError, () => res.boom.badRequest())
        .catch((err) => handle(err));
};

/**
 *
 * Deletes an existing user.
 *
 * @param {Object} req - the user request
 * @param {Object} res - the response to be sent
 * @param {Object} handle - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.delete = function (req, res, handle) {
    if (isNaN(parseInt(req.params.userId, 10))) {
        throw res.boom.badRequest();
    }
    const userId = parseInt(req.params.userId, 10);

    return db.UserGroup.destroy({where: {userId}})
        .then(() => db.User.destroy({where: {id: userId}}))
        .then(() => res.status(204).send())
        .catch(db.Sequelize.ValidationError, () => res.boom.badRequest())
        .catch((err) => handle(err));
};

/**
 *
 * Get all user's posts
 * Can get altered with scopes.
 *
 * @example GET /users/:userId/posts?published=true  -> return all published posts
 * @example GET /users/:userId/posts?published=false -> return all drafted posts
 *
 * @param {obj} req     - the user request
 * @param {obj} res     - the response to be sent
 * @param {obj} handle  - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.posts = function (req, res, handle) {
    if (isNaN(parseInt(req.params.userId, 10))) {
        throw res.boom.badRequest();
    }
    const userId = parseInt(req.params.userId, 10);

    let posts = db.Post;

    if (req.query.published) {
        if (req.query.published === 'true') {
            posts = posts.scope('published');
        } else if (req.query.published === 'false') {
            posts = posts.scope('draft');
        }
    }

    return posts.findAll({where: {authorId: userId}})
        .then((response) => res.status(200).json(response))
        .catch((err) => handle(err));
};

/**
 *
 * Get all user's groups.
 *
 * @param {obj} req     the user request.
 * @param {obj} res     the response to be sent
 * @param {obj} handle  the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.getGroups = function (req, res, handle) {
    if (isNaN(parseInt(req.params.userId, 10))) {
        throw res.boom.badRequest();
    }
    const userId = parseInt(req.params.userId, 10);

    return db.User.findOne({
        where: {id: userId},
        include: ['groups']
    })
        .then((user) => {
            if (user) {
                return res.status(200).json(user.groups);
            }
            throw res.boom.badRequest();

        })
        .catch((err) => handle(err));
};

/**
 *
 * Add user to group.
 *
 * @param {Object} req - the user request
 * @param {Object} res - the response to be sent
 * @param {Object} handle - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.addGroups = function (req, res, handle) {
    if (isNaN(parseInt(req.params.userId, 10))) {
        throw res.boom.badRequest();
    }
    const userId = parseInt(req.params.userId, 10);

    return policy.filterAddGroups(req.body.groupsId, req.session.auth)
        .then((groups) => db.User.findById(userId)
            .then((user) => {
                if (user) {
                    return user.addGroups(groups);
                }
                throw res.boom.badRequest();

            })
            .then(() => res.status(204).send()))
        .catch((err) => handle(err));
};

/**
 *
 * Remove user from groups.
 *
 * @param {Object} req - the user request
 * @param {Object} res - the response to be sent
 * @param {Object} handle - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.deleteGroups = function (req, res, handle) {
    if (isNaN(parseInt(req.params.userId, 10))) {
        throw res.boom.badRequest();
    }
    const userId = parseInt(req.params.userId, 10);

    return policy.filterDeleteGroups(req.body.groupsId, userId, req.session.auth)
        .then((groups) => db.User.findById(userId)
            .then((user) => user.removeGroups(groups))
            .then(() => res.status(204).send()))
        .catch((err) => handle(err));
};
