'use strict';

const winston = require('winston');
const sequelize = require('sequelize');
const config = require('../config/config');
const fs = require('fs');
const util = require('util');
const { zip } = require('zip-a-folder');
const findRoot = require('find-root');
const path = require('path');
const moment = require('moment');
const request = require('request-promise-native');
const rimraf = require('rimraf');
const flatted = require('flatted');


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

    if(req.transaction.options.test && !req.transaction.options.testSaveLogs) {
        return true;
    }

    const root = findRoot(__dirname);
    const date = moment().format('YYYY-MM-DD');
    const time = moment().format('HH-mm-ss-SSS');

    // Create crashes folder
    try {
        await (util.promisify(fs.mkdir))(path.join(root, 'crashes'), {recursive: true});
    } catch (e) {
        if(e.code != 'EEXIST') { throw e; }
    }
    // Create temp folder
    const temp = path.join(root, 'crashes', 'temp-crash-' + date + '-' + time)
    const mkdirP = util.promisify(fs.mkdir)
    await mkdirP(temp);

    // Copy files
    const copyFileP = util.promisify(fs.copyFile)
    const logs = path.join(root, 'logs', date);
    await copyFileP(path.join(logs, 'debug.log'), path.join(temp, 'debug.log'));
    await copyFileP(path.join(logs, 'info.log'), path.join(temp, 'info.log'));

    // Create new file
    // Note : we use flatted because JSON.stringify() throws errors with circular structures
    await (util.promisify(fs.writeFile))(path.join(temp, 'crashinfo.log'),
        "err : \n" + flatted.stringify(err) + "\nreq : \n" + flatted.stringify(req) + "\nres : \n" + flatted.stringify(res));

    // Zip
    await zip(temp, path.join(root, 'crashes', 'crash-' + date  + '-' + time + '.zip'));

    // Delete crashes folder
    await (util.promisify(rimraf))(temp);

    // Upload on Trello
    let list_id = "5d9f455e6b055c64ebe6d01f"
    if(!process.env.TRELLO_KEY || !process.env.TRELLO_TOKEN) {
        let msg = "Cannot upload error zip to trello : need key and token !"
        console.error(msg);
        req.transaction.logger.error(msg);
        return true;
    }

    const key = process.env.TRELLO_KEY;
    const token = process.env.TRELLO_TOKEN;
    let name = "ERROR 500 at "+req.originalUrl+" ("+date+' '+time+")";
    if(req.transaction.options.test) {
        name = "[TEST] ERROR";
    }
    let desc = err;
    let card_res = await request({
        method: "POST",
        uri: "https://api.trello.com/1/cards/", 
        json: true,
        qs: {
            name: name,
            desc: desc,
            idList: list_id,
            key, token
          }
    });
    let attachment_path = path.join(root, 'crashes', 'crash-' + date  + '-' + time + '.zip');
    let upload_res = await request({
        method: "POST",
        uri: "https://api.trello.com/1/cards/"+card_res.id+"/attachments",
        json: true,
        qs: {
            name: "CRASH LOGS",
            key, token
        },
        headers: {
            "Content-Type": "multipart/form-data"
        },
        formData : {
            "file" : fs.createReadStream(attachment_path)
        }
    });

    req.transaction.logger.error("Uploaded as card id "+upload_res.id);


}


// No choice, it's Express' default error handler parameters ...
// eslint-disable-next-line max-params
const handler = async (err, req, res) => {

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
        await saveLogs(req, res, err);
        sendError(res, err, 'badImplementation');
    }
};

module.exports = (err, req, res, next) => {
    return Promise.resolve(handler(err, req, res)).catch(err => {console.error(err); return next(err, req, res);});
};
