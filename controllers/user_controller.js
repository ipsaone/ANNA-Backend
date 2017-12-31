'use strict';

/**
 * @file Manages users
 * @see {@link module:user}
 */

/**
 * @module user
 */

const db = require('../models');

/**
 *
 * Get all existing users.
 *
 * @function index
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 * @param {Object} handle - The error handling function.
 *
 * @returns {Object} Promise.
 *
 * @memberof module:user
 * @inner
 *
 */
exports.index = function (req, res, handle) {
    return db.User.findAll()
        .then((users) => res.status(200).json(users))
        .catch((err) => handle(err));
};


/**
 *
 * Get a single user.
 *
 * @function show
 *
 * @param {obj} req     - The user request.
 * @param {obj} res     - The response to be sent.
 * @param {obj} handle  - The error handling function.
 *
 * @returns {Object} Promise.
 *
 * @memberof module:user
 * @inner
 *
 */
exports.show = function (req, res, handle) {
    if (typeof req.params.userId !== 'number') {
        throw res.boom.badRequest();
    }

    return db.User.findOne({
        where: {id: req.params.userId},
        include: ['groups']
    })
        .then((user) => {
            if (user) {
                return res.status(200).json(user);
            }
            throw res.boom.badRequest();

        })
        .catch((err) => handle(err));
};

/**
 *
 * Create a store a new user.
 *
 * @function store
 *
 * @param {obj} req     - The user request.
 * @param {obj} res     - The response to be sent.
 * @param {obj} handle  - The error handling function.
 *
 * @returns {Object} Promise.
 *
 * @memberof module:user
 * @inner
 *
 */
exports.store = function (req, res, handle) {
    return db.User.create(req.body)
        .then((user) => res.status(201).json(user))
        .catch(db.Sequelize.ValidationError, () => res.boom.badRequest())
        .catch((err) => handle(err));
};

/**
 *
 * Updates an existing user.
 *
 * @function update
 *
 * @param {obj} req     - The user request.
 * @param {obj} res     - The response to be sent.
 * @param {obj} handle  - The error handling function.
 *
 * @returns {Object} Promise.
 *
 * @memberof module:user
 * @inner
 *
 */
exports.update = function (req, res, handle) {
    if (typeof req.params.userId !== 'number') {

        throw res.boom.badRequest();
    }

    return db.User.findOne({where: {id: req.params.userId}})
        .then((record) => record.update(req.body))
        .then(() => res.status(204).json({}))
        .catch(db.Sequelize.ValidationError, () => res.boom.badRequest())
        .catch((err) => handle(err));
};

/**
 *
 * Deletes an existing user.
 *
 * @function delete
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 * @param {Object} handle - the error handling function
 *
 * @returns {Object} promise
 *
 * @memberof module:user
 * @inner
 *
 */
exports.delete = function (req, res, handle) {
    if (typeof req.params.userId !== 'number') {

        throw res.boom.badRequest();
    }

    return db.UserGroup.destroy({where: {userId: req.params.userId}})
        .then(() => db.User.destroy({where: {id: req.params.userId}}))
        .then(() => res.status(204).send())
        .catch(db.Sequelize.ValidationError, () => res.boom.badRequest())
        .catch((err) => handle(err));
};

/**
 *
 * Get all user's posts
 * Can get altered with scopes.
 *
 * @function posts
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
 * @memberof module:user
 * @inner
 *
 */
exports.posts = function (req, res, handle) {
    if (typeof req.params.userId !== 'number') {

        handle(res.boom.badRequest());
    }
    let posts = db.Post;

    if (req.query.published) {
        if (req.query.published === 'true') {
            posts = posts.scope('published');
        } else if (req.query.published === 'false') {
            posts = posts.scope('draft');
        }
    }

    return posts.findAll({where: {authorId: req.params.userId}})
        .then((response) => res.status(200).json(response))
        .catch((err) => handle(err));
};

/**
 *
 * Get all user's groups.
 *
 * @function getGroups
 *
 * @param {obj} req     - The user request.
 * @param {obj} res     - The response to be sent.
 * @param {obj} handle  - The error handling function.
 *
 * @returns {Object} Promise.
 *
 * @memberof module:user
 * @inner
 *
 */
exports.getGroups = function (req, res, handle) {
    if (typeof req.params.userId !== 'number') {

        throw res.boom.badRequest();
    }

    return db.User.findOne({
        where: {id: req.params.userId},
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
 * @function addGroups
 *
 * @param {Object} req - The user request.
 * @param {Object} res - the response to be sent
 * @param {Object} handle - the error handling function
 *
 * @returns {Object} promise
 *
 * @memberof module:user
 * @inner
 *
 */
exports.addGroups = function (req, res, handle) {
    if (typeof req.params.userId !== 'number') {

        throw res.boom.badRequest();
    }

    return db.User.findById(req.params.userId)
        .then((user) => {
            if (user) {
                return user.addGroups(req.body.groupsId);
            }
            throw res.boom.badRequest();

        })
        .then(() => res.status(204).send())
        .catch((err) => handle(err));
};

/**
 *
 * Remove user from groups.
 *
 * @function deleteGroups
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 * @param {Object} handle - the error handling function
 *
 * @returns {Object} promise
 *
 * @memberof module:user
 * @inner
 *
 */
exports.deleteGroups = function (req, res, handle) {
    if (typeof req.params.userId !== 'number') {

        throw res.boom.badRequest();
    }

    return db.User.findById(req.params.userId)
        .then((user) => user.removeGroups(req.body.groupsId))
        .then(() => res.status(204).send())
        .catch((err) => handle(err));
};
