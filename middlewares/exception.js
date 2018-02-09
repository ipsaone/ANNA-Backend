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

const winston = require('winston');

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
        winston.error('Couldn\'t send error to client');
    }

    // Build the error and send it
    const builder = res.boom[type];

    builder(err.message);
};

const logError = (err) => {

    /**
     * CONSOLE OUTPUT
     */
    winston.error('Exception received by handler :');
    if (err instanceof Error) {
        winston.error(err.stack);
    } else {
        winston.error(`Error type : ${err.constructor.name}`);
        const e = new Error();

        winston.error(e.stack);
    }
};


// No choice, it's Express' default error handler parameters ...
// eslint-disable-next-line max-params
module.exports = (err, req, res, next) => {

    // Check a response has not been half-sent
    if (res.headersSent) {
        winston.debug('Hearders already sent', {reqid: req.id});

        return next(err);
    }

    if (typeof err.type && err.type === 'entity.parse.failed') {
        // Bad JSON was sent

        sendError(res, err, 'badRequest');
        winston.error('Could not parse entity', {reqid: req.id});
    } else if (err.constructor.name === 'ValidationError') {
        // Validation error

        sendError(res, err, 'badRequest');
        winston.error('Unapropriate request');
    } else {
        // Unknown error

        sendError(res, err, 'badImplementation');
        logError(err);

    }

    return true;

};
