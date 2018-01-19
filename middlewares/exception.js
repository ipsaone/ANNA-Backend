'use strict';

/**
 * @file
 * @see {@link module:exception}
 */

/**
 * @module exception
 */

/*
 * Commented line to fix eslint error 'http is assigned a value but never used.'
 * const http = require('http');
 */

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

const sendError = (res, err, type) => {

    // Check we can send the error to the client
    const canSend = typeof res.boom !== 'undefined';

    if (!canSend) {
        console.log('Couldn\'t send error to client');
    }

    // Build the error and send it
    const builder = res.boom[type];

    builder(err.message);

};

const logError = (err) => {

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
};


// No choice, it's Express' default error handler parameters ...
// eslint-disable-next-line max-params
module.exports = (err, req, res, next) => {

    // Check a response has not been half-sent
    if (res.headersSent) {
        return next(err);
    }


    if (typeof err.type && err.type === 'entity.parse.failed') {
        // Bad JSON was sent

        sendError(res, err, 'badRequest');

    } else {
        // Unknown error

        sendError(res, err, 'badImplementation');
        logError(err);

    }

};

