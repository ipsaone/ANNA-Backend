const winston = require('winston');
const winston_cfg = require('../config/winston');



module.exports = (req, res, next) => {
    req.transaction = {};
    req.transaction.info = {requestId : req.id};
    
    let lbl_format = winston.format.label({label : {transactionInfo : req.transaction.info}});
    let json_format = winston.format.json();
    let timestamp_format = winston.format.timestamp();
    let format = winston.format.combine(lbl_format, timestamp_format, json_format);
    req.transaction.logger = winston.createLogger({transports: winston_cfg.transports, format});

    req.transaction.logger.debug('Transaction created successfully')
    return next();

};
