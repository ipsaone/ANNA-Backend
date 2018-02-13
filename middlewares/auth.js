'use strict';

/**
 * @file
 * @see {@link module:auth}
 */

/**
 * @module auth
 */

const config = require('../config/config');
const winston = require('winston');


/**
 *
 * Checks the request to see if the user is logged in.
 *
 * @function exports
 *
 * @param {obj} req     - The user request.
 * @param {obj} res     - The response to be sent.
 * @param {obj} next    - The next middleware function.
 *
 * @returns {obj} Call to next.
 *
 */
module.exports = (req, res, next) => {
    winston.debug('Checks if user is logged in.', {reqid: req.id});
    if (req.path !== '/' && req.path !== '/auth/login' && req.path !== '/auth/check') {
        if (req.session.auth || config.session.check === 'false') {
            return next();
        }

        return res.boom.unauthorized('You must be logged in');

    }

    return next();

};
