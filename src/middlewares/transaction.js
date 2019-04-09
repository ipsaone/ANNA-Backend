const winston = require('winston');
const winston_cfg = require('../config/winston');

let globalFormat = winston.format.combine(winston.format.timestamp(), winston.format.json());
let globalLogger = winston.createLogger({transports: winston_cfg.transports, format: globalFormat});

process.on('uncaughtException', err => {
    globalLogger.error('Unexpected, uncaught exception. Quitting', {error : err});
})

module.exports = (req, res, next) => {
    req.transaction = {boom : res.boom, reqBody: req.body};
    req.transaction.info = {requestId : req.id};

    let lbl_format = winston.format.label({label : {transactionInfo : req.transaction.info}});
    let json_format = winston.format.json();
    let timestamp_format = winston.format.timestamp();
    let format = winston.format.combine(lbl_format, timestamp_format, json_format);
    req.transaction.logger = winston.createLogger({transports: winston_cfg.transports, format});

  

    req.transaction.logger.debug('Transaction created successfully')
    return next();

};
