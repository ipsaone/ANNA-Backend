const winston = require('winston');
const winston_cfg = require('../config/winston');



module.exports = (req, res, next) => {
    req.transaction = {};
    req.transaction.info = {requestId : req.id};

    let format = winston.format.combine(
        winston.format.label({label : {transactionInfo : req.transaction.info}}),
        winston.format.timestamp(), 
        winston.format.prettyPrint(),
    );
    req.transaction.logger = winston.createLogger({transports: winston_cfg.transports, format});

    req.transaction.logger.debug('Transaction created successfully')
    return next();

};
