const winston = require('winston');
const util = require('util');
const nodemailer = require('nodemailer');
const path = require('path');
const findRoot = require('find-root');
const root = findRoot(__dirname);
const config = require(path.join(root, './src/config/config'));



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

        let mail;
        if(process.env.TEST) {
            
            // Generate test SMTP service account from ethereal.email
            // Only needed if you don't have a real mail account for testing
            let account = await util.promisify(nodemailer.createTestAccount)();
                
            // create reusable transporter object using the default SMTP transport
            mail = {
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: account.user, // generated ethereal user
                    pass: account.pass // generated ethereal password
                }
            };
        } else {
            mail = {
                host: 'smtp.eu.mailgun.org',
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.MAILGUN_USER, // generated ethereal user
                    pass: process.env.MAILGUN_PWD // generated ethereal password
                }
            };
        }

        req.transaction.mailer = nodemailer.createTransport(mail);

        req.transaction.logger.debug('Transaction created successfully')
        return next();

    }
};
