const winston = require('winston');
const util = require('util');
const nodemailer = require('mailgun-js');
const path = require('path');
const findRoot = require('find-root');
const root = findRoot(__dirname);
const config = require(path.join(root, './src/config/config'));

const mailgun = require('mailgun-js');
const mg_domain = "mail.ipsaone.space";
const mg_apikey = process.env.MAILGUN_APIKEY;


let done = false;

module.exports = options => {

    const winston_cfg = require('../config/winston')(options);

    let globalFormat = winston.format.combine(winston.format.timestamp(), winston.format.json());
    let globalLogger = winston.createLogger({transports: winston_cfg.transports, format: globalFormat});

    if(!done) {
        // Will be called multiple times for tests, so let's limit it
        process.on('uncaughtException', err => {
            globalLogger.error('Unexpected, uncaught exception. Quitting', {error : String(err)});
            console.error(err);
        })
        done = true;
    }

    return async (req, res, next) => {
        req.transaction = {boom : res.boom, reqParams: req.params, reqBody: req.body};
        req.transaction.info = {requestId : req.id, path : req.originalUrl};

        let lbl_format = winston.format.label({label : {transactionInfo : req.transaction.info}});
        let json_format = winston.format.json();
        let timestamp_format = winston.format.timestamp();
        let format = winston.format.combine(lbl_format, timestamp_format, json_format);
        req.transaction.logger = winston.createLogger({transports: winston_cfg.transports, format});
        req.transaction.options = options;

        if(mg_apikey) {
            req.transaction.mg = mailgun({apiKey: mg_apikey, domain: mg_domain, host: "api.eu.mailgun.net"});
        }
        

        req.transaction.logger.debug('Transaction created successfully')
        return next();

    }
};
