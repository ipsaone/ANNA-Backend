'use strict';

/**
 * @file Manages authentification
 * @see {@link module:auth}
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
 * @param {obj} req      - The user request.
 * @param {obj} res      - The response to be sent.
 * @param {obj} handle   - The error handling function.
 *
 * @returns {Object} Promise.
 *
 * @memberof module:auth
 * @inner
 *
 */
exports.login = async (req, res) => {
    if (typeof req.body.username !== 'string' ||
        typeof req.body.password !== 'string') {

        throw res.boom.badRequest();
    }


    const user = await db.User.findOne({
        where: {'username': req.body.username},
        include: [
            'groups',
            'events',
            'participatingMissions'
        ]
    });

    if (!user) {
        throw res.boom.notFound('Bad username');
    }

    const accept = await bcrypt.compare(req.body.password, user.password);

    if (!accept) {
        throw res.boom.unauthorized('Bad password');
    }

    req.session.auth = user.id;
    req.session.save();

    return res.status(200).json(user);
};


/**
 *
 * Logs out a user.
 *
 * @function logout
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 * @memberof module:auth
 * @inner
 *
 */
exports.logout = (req, res) => {
    req.session.auth = null;
    req.session.save();

    return res.status(200).json({});
};


/**
 *
 * Checks a user is connected.
 *
 * @function  check
 *
 * @param {obj} req - The user request.
 * @param {obj} res - the response to be sent
 * @param {obj} handle - the error handling function
 *
 * @returns {obj} promise
 *
 * @memberof module:auth
 * @inner
 *
 */
exports.check = async (req, res) => {
    if (!req.session.auth) {
        throw res.boom.unauthorized();
    }

    const user = await db.User.findOne({
        where: {id: req.session.auth},
        include: [
            'groups',
            'events',
            'participatingMissions'
        ]
    });

    if (!user) {
        throw res.boom.notFound();
    }

    return res.status(200).json(user);


};
