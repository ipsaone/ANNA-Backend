const winston = require('winston');
const winston_cfg = require('../config/winston');

module.exports = (req, res, next) => {

    req.transaction = {};
    req.transaction.id = req.id;

    req.transaction.logger = winston.createLogger(winston_cfg.winston_opts);

    req.transaction.logger.debug('Transaction created successfully')
    return next();

};
