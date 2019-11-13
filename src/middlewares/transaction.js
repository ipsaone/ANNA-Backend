const winston = require('winston');


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

    return (req, res, next) => {
        req.transaction = {boom : res.boom, reqParams: req.params, reqBody: req.body};
        req.transaction.info = {requestId : req.id, path : req.originalUrl};

        let lbl_format = winston.format.label({label : {transactionInfo : req.transaction.info}});
        let json_format = winston.format.json();
        let timestamp_format = winston.format.timestamp();
        let format = winston.format.combine(lbl_format, timestamp_format, json_format);
        req.transaction.logger = winston.createLogger({transports: winston_cfg.transports, format});
        req.transaction.options = options;

        req.transaction.logger.debug('Transaction created successfully')
        return next();

    }
};
