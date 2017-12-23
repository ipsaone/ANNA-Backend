'use strict';

const config = require('../config/config');

/**
 *
 * Checks the request to see if the user is logged in.
 *
 * @param {obj} req     - the user request
 * @param {obj} res     the response to be sent
 * @param {obj} next    the next middleware function
 *
 * @returns {obj} call to next
 *
 */
module.exports = (req, res, next) => {
    if (req.url !== '/' && req.url !== '/auth/login' && req.url !== '/auth/check') {
        if (req.session.auth || config.session.check === 'false') {
            return next();
        }

        return res.boom.unauthorized('You must be logged in');

    }

    return next();

};
