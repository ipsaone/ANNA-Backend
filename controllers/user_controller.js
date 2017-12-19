'use strict';

const db = require('../models');

/**
 *
 * Get all existing users
 *
 * @param {obj} req     the user request
 * @param {obj} res     the response to be sent
 * @param {obj} handle  the error handling function
 *
 * @returns {obj} promise
 *
 */
exports.index = function (req, res, handle) {
    db.User.findAll()
        .then((users) => res.status(200).json(users))
        .catch((err) => handle(err));
};


/**
 *
 * Get a single user
 *
 * @param {obj} req     the user request
 * @param {obj} res     the response to be sent
 * @param {obj} handle  the error handling function
 *
 * @returns {obj} promise
 *
 */
exports.show = function (req, res, handle) {
    db.User.findOne({
        where: {id: req.params.userId},
        include: ['groups']
    })
        .then((user) => {
            if (user) {
                return res.status(200).json(user);
            }
            console.log('User not found');
            throw res.boom.badRequest();

        })
        .catch((err) => handle(err));
};

/**
 *
 * Create a store a new user
 *
 * @param {obj} req     the user request
 * @param {obj} res     the response to be sent
 * @param {obj} handle  the error handling function
 *
 * @returns {obj} promise
 *
 */
exports.store = function (req, res, handle) {
    db.User.create(req.body)
        .then((user) => res.status(201).json(user))
        .catch(db.Sequelize.ValidationError, () => res.boom.badRequest())
        .catch((err) => handle(err));
};

/**
 *
 * Updates an existing user
 *
 * @param {obj} req     the user request
 * @param {obj} res     the response to be sent
 * @param {obj} handle  the error handling function
 *
 * @returns {obj} promise
 *
 */
exports.update = function (req, res, handle) {
    db.User.findOne({where: {id: req.params.userId}})
        .then((record) => record.update(req.body))
        .then(() => res.status(204).json({}))
        .catch(db.Sequelize.ValidationError, () => res.boom.badRequest())
        .catch((err) => handle(err));
};

/**
 *
 * Deletes an existing user
 *
 * @param {obj} req     the user request
 * @param {obj} res     the response to be sent
 * @param {obj} handle  the error handling function
 *
 * @returns {obj} promise
 *
 */
exports.delete = function (req, res, handle) {
    db.UserGroup.destroy({where: {userId: req.params.userId}})
        .then(() => db.User.destroy({where: {id: req.params.userId}}))
        .then(() => res.status(204).send())
        .catch(db.Sequelize.ValidationError, () => res.boom.badRequest())
        .catch((err) => handle(err));
};

/**
 *
 * Get all user's posts
 * Can get altered with scopes
 *
 * @example GET /users/:userId/posts?published=true  -> return all published posts
 * @example GET /users/:userId/posts?published=false -> return all drafted posts
 *
 * @param {obj} req     the user request
 * @param {obj} res     the response to be sent
 * @param {obj} handle  the error handling function
 *
 * @returns {obj} promise
 *
 */
exports.posts = function (req, res, handle) {
    let posts = db.Post;

    if (req.query.published) {
        if (req.query.published === 'true') {
            posts = posts.scope('published');
        } else if (req.query.published === 'false') {
            posts = posts.scope('draft');
        }
    }

    posts.findAll({where: {authorId: req.params.userId}})
        .then((response) => res.status(200).json(response))
        .catch((err) => handle(err));
};

/**
 *
 * Get all user's groups
 *
 * @param {obj} req     the user request
 * @param {obj} res     the response to be sent
 * @param {obj} handle  the error handling function
 *
 * @returns {obj} promise
 *
 */
exports.getGroups = function (req, res, handle) {
    db.User.findOne({
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
 * Add user to group
 *
 * @param {obj} req     the user request
 * @param {obj} res     the response to be sent
 * @param {obj} handle  the error handling function
 *
 * @returns {obj} promise
 *
 */
exports.addGroups = function (req, res) {
    db.User.findById(req.params.userId)
        .then((user) => {
            if (user) {
                return user.addGroups(req.body.groupsId);
            }
            throw res.boom.badRequest();

        })
        .then(() => res.status(204).send())
        .catch((err) => console.log(err));
};

/**
 *
 * Remove user from groups
 *
 * @param {obj} req     the user request
 * @param {obj} res     the response to be sent
 * @param {obj} handle  the error handling function
 *
 * @returns {obj} promise
 *
 */
exports.deleteGroups = function (req, res) {
    db.User.findById(req.params.userId)
        .then((user) => user.removeGroups(req.body.groupsId))
        .then(() => res.status(204).send())
        .catch((err) => console.log(err));
};
