'use strict';

const db = require('../models');
const bcrypt = require('bcrypt');

/**
 *
 * Logs in a user.
 *
 * @param {obj} req      - The user request.
 * @param {obj} res      the response to be sent.
 * @param {obj} handle   - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.login = async (req, res) => {
    if (typeof req.body.username !== 'string' ||
        typeof req.body.password !== 'string') {

        throw res.boom.badRequest();
    }


    const user = await db.User.findOne({
        where: {'username': req.body.username},
        include: ['groups']
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

    return res.status(200).json({
        id: user.id,
        username: user.username,
        groups: user.groups
    });
};


/**
 *
 * Logs out a user.
 *
 * @param {Object} req - the user request
 * @param {Object} res - the response to be sent
 *
 * @returns {Object} promise
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
 * @param {obj} req - the user request
 * @param {obj} res - the response to be sent
 * @param {obj} handle - the error handling function
 *
 * @returns {obj} promise
 *
 */
exports.check = async (req, res) => {
    if (!req.session.auth) {
        throw res.boom.unauthorized();
    }

    const user = await db.User.findOne({
        where: {id: req.session.auth},
        include: ['groups']
    });

    if (!user) {
        throw res.boom.notFound();
    }

    return res.status(200).json({
        id: user.id,
        username: user.username,
        groups: user.groups
    });


};
