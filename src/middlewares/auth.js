'use strict';


const config = require('../config/config');
const winston = require('winston');



module.exports = (req, res, next) => {
    req.transaction.logger.debug('Check if user is logged in.', {reqid: req.id});
    if (req.path !== '/' && req.path !== '/auth/login' && req.path !== '/auth/check') {
        if (req.session.auth || config.session.check === 'false') {
            req.session.touch();
            req.transaction.logger.debug('User is logged. Request allowed', {reqid: req.id})
            req.transaction.info.userId = req.session.auth;
            req.transaction.info.sessionId = req.session.id;
            return next();
        }

        req.transaction.logger.info('Request rejected (not logged in)', {reqid: req.id});
        return res.boom.unauthorized('You must be logged in');

    }

    req.transaction.logger.debug('Request allowed, session not touched');   
    return next();

};
