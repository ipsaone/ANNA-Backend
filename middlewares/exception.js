'use strict';

/**
 * @file
 * @see {@link module:exception}
 */

/**
 * @module exception
 */

const http = require('http');

/**
 *
 * Handles a raised exception
 * If possible, send an error to the client
 * Logs the errors to console
 * @function exports
 *
 * @param {obj} err     the exception that was raised
 * @param {obj} req     the user request
 * @param {obj} res     the response to be sent
 *
 */

// No choice, it's Express' default error handler parameters ...
// eslint-disable-next-line max-params
module.exports = (err, req, res, next) => {

    if (res.headersSent) {
        return next(err);
    }

    /**
     * CONSOLE OUTPUT
     */
    console.log('-------------------------------');
    console.log('Exception received by handler :');
    if (err instanceof Error) {
        console.log(err.stack);
    } else {
        console.log(`Error type : ${err.constructor.name}`);
        console.trace();
    }
    console.log('-------------------------------');

    /**
     * CLIENT OUTPUT
     */
    if (!res.headersSent && typeof res !== 'undefined' && typeof res.boom !== 'undefined') {
        res.boom.badImplementation(err.message);
    } else {
        console.log('Couldn\'t send error to client');

        return next();
    }


};
