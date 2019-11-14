'use strict';


const config = require('../config/config');
const minimatch = require('minimatch');

let authorized_paths = [
    '/',
    '/auth/*',
    '/storage/files/([0-9]+)'
]

module.exports = (req, res, next) => {
    req.transaction.info.userId = req.session.auth ? req.session.auth : undefined;
    req.transaction.info.sessionId = req.session.id ? req.session.id : undefined;


    req.transaction.logger.debug('Check if user is logged in.', {reqid: req.id});
   // Checks if the requested path isn't in whitelist
    if ( authorized_paths.map(path => minimatch(req.path, path)).filter(match => (match === true)).length === 0 ) {
        req.transaction.logger.debug('Path needs login', {session: req.session});
        if (req.session.auth || config.session.check === 'false') {
            req.session.touch();
            req.transaction.logger.debug('User is logged. Request allowed', {reqid: req.id})
           
            return next();
        }

        req.transaction.logger.info('Request rejected (not logged in)', {reqid: req.id});
        return res.boom.unauthorized('You must be logged in');

    }

    req.transaction.logger.debug('Request allowed, session untouched');
    return next();

};
