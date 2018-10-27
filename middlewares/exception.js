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
const sequelize = require('sequelize');

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
    builder(err);
};

const logError = (err) => {

    /**
     * CONSOLE OUTPUT
     */
    console.error('Exception received by handler :')
    winston.error('Exception received by handler :');
    if (err instanceof Error) {
        console.error(err.stack);
        winston.error(err.stack);
    } else {
        console.error(`Error type : ${err.constructor.name}`);
        winston.error(`Error type : ${err.constructor.name}`);
        const except = new Error();

        winston.error(except.stack);
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

    // Sending an error is possible
    if (typeof err.type && err.type === 'entity.parse.failed') { // Bad JSON was sent
        sendError(res, err, 'badRequest');
        winston.error('Could not parse entity', {reqid: req.id});

    } else if (err instanceof sequelize.ValidationError) { // Validation error
        sendError(res, err.errors.map(item => item.message), 'badRequest');
        winston.error('Unapropriate request', {reqid: req.id});

    } else if (err instanceof sequelize.ForeignKeyConstraintError) {
        sendError(res, "Database constraint violation", 'badRequest');
        winston.error('Foreign key constraint error', {reqid: req.id});

    } else { // Unknown error
        sendError(res, err, 'badImplementation');
        logError(err);

    }

    return true;

};
