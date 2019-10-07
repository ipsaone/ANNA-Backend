'use strict';

const winston = require('winston');
const sequelize = require('sequelize');
const nodemailer = require('nodemailer');
const config = require('../config/config');
const fs = require('fs');
const util = require('util');
const { zip } = require('zip-a-folder');
const findRoot = require('find-root');
const path = require('path');

var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: config.email.auth,
  });

const sendError = (res, err, type) => {

    // Check we can send the error to the client
    const canSend = typeof res.boom !== 'undefined';

    if (!canSend) {
        req.transaction.logger.error('Couldn\'t send error to client');
    }

    // Build the error and send it
    const builder = res.boom[type];
    return builder(err);
};

const logError = (req, err) => {

    req.transaction.logger.error('Exception received by handler', {err});
    if (err instanceof Error) {
        req.transaction.logger.error(err.stack);
    } else {
        req.transaction.logger.error(`Error type : ${err.constructor.name}`);
        const except = new Error();

        req.transaction.logger.error(except.stack);
    }
};

const saveLogs = async (req, res, err) => {
    const root = findRoot(__dirname);
    const time = Math.floor(Date.now() / 1000);

    // Create crashes folder 
    try {
        await (util.promisify(fs.mkdir))(path.join(root, 'crashes'), {recursive: true});
    } catch (e) {
        if(e.code != 'EEXIST') { throw e; }
    }
    // Create temp folder
    const temp = path.join(root, 'crashes', 'temp-crash-' + time)
    const mkdirP = util.promisify(fs.mkdir)
    await mkdirP(temp);

    // Copy files
    const copyFileP = util.promisify(fs.copyFile)
    await copyFileP(path.join(root, 'logs', 'debug.log'), path.join(temp, 'debug.log'));
    await copyFileP(path.join(root, 'logs', 'info.log'), path.join(temp, 'info.log'));

    // Create new file
    await (util.promisify(fs.writeFile))(path.join(temp, 'crashinfo.log'), 
        "err : \n" + err + "\n\req : \n" + req + "\n\res : \n" + res);

    // Zip
    await zip(temp, path.join(root, 'crashes', 'crash-' + time + '.zip'));

    // Delete crashes folder
    await (util.promisify(fs.rmdir))(temp);

    console.error("all done");

}


// No choice, it's Express' default error handler parameters ...
// eslint-disable-next-line max-params
module.exports = (err, req, res, next) => {

    // Check a response has not been half-sent
    if (res.headersSent) {
        req.transaction.logger.debug('Hearders already sent', {reqid: req.id});
        return next(err);
    }

    // Sending an error is possible
    if (typeof err.type && err.type === 'entity.parse.failed') { // Bad JSON was sent
        sendError(res, err, 'badRequest');
        req.transaction.logger.error('Could not parse entity', {reqid: req.id});

    } else if (err instanceof sequelize.ValidationError) { // Validation error
        sendError(res, err.errors.map(item => item.message), 'badRequest');
        req.transaction.logger.error('Unapropriate request', {reqid: req.id});

    } else if (err instanceof sequelize.ForeignKeyConstraintError) {
        let message = 'Foreign key constraint error';
        if(err.original.errno == 1451) {
            message += ' (critical objects still exist)';
        }
        sendError(res, message, 'badRequest');
        req.transaction.logger.error(message, {reqid: req.id});


    } else { // Unknown error
        
        logError(req, err);
        let saveP = saveLogs(req, res, err)
        return saveP.then(() => {
            sendError(res, err, 'badImplementation');

        })
        
    }

    return true;
};