'use strict';

/**
 * @file Manages authentification
 */

/**
 * @module auth
 */

const db = require('../models');
const bcrypt = require('bcrypt');

/**
 *
 * Logs in a user.
 *
 * @function login
 *
 * @param {obj} req      the user request
 * @param {obj} res      the response to be sent
 * @param {obj} handle   the error handling function
 *
 * @returns {Object} promise
 *
 * @memberof module:auth
 * @inner
 *
 */
exports.login = (req, res, handle) => {
    if (typeof req.body.username !== 'string' ||
        typeof req.body.password !== 'string') {

        throw res.boom.badRequest();
    }

    return db.User.findOne({
        where: {'username': req.body.username},
        include: ['groups']
    })
        .then((user) => {
            if (!user) {
                throw res.boom.notFound('Bad username');
            }

            return user;
        })
        .then((user) =>
            bcrypt.compare(req.body.password, user.password)
            // Check password
                .then((accept) => {
                    if (!accept) {
                        throw res.boom.unauthorized('Bad password');
                    }

                    return true;
                })
            // Set user session variables
                .then(() => {
                    req.session.auth = user.id;

                    return true;
                })
            // Send response
                .then(() => res.status(200).json({
                    id: user.id,
                    username: user.username,
                    groups: user.groups
                })))
        .catch((err) => handle(err));
};


/**
 *
 * Logs out a user.
 *
 * @function logout
 *
 * @param {Object} req - The user request.
 * @param {Object} res - the response to be sent
 *
 * @returns {Object} promise
 *
 * @memberof module:auth
 * @inner
 *
 */
exports.logout = (req, res) => {
    req.session.auth = null;
    res.status(200).json({});
};


/**
 *
 * Checks a user is connected.
 *
 * @function  check
 *
 * @param {obj} req - the user request
 * @param {obj} res - the response to be sent
 * @param {obj} handle - the error handling function
 *
 * @returns {obj} promise
 *
 * @memberof module:auth
 * @inner
 *
 */
exports.check = (req, res, handle) => {
    if (typeof req.body.username !== 'number') {

        throw res.boom.badRequest();
    }

    if (req.session.auth) {
        return db.User.findOne({
            where: {id: req.session.auth},
            include: ['groups']
        })
            .then((user) => {
                if (user) {
                    return res.json({
                        id: user.id,
                        username: user.username,
                        groups: user.groups
                    });

                }
                throw res.boom.notFound();

            })
            .catch((err) => handle(err));
    }
    throw res.boom.unauthorized();

};
