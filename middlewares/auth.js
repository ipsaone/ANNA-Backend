'use strict';

const config = require('../config/config');

module.exports = (req, res, next) => {
    if (req.url !== '/' && req.url !== '/auth/login') {
        if (typeof(req.session.userID) === 'undefined' && config.session.check !== "false") {
            return res.json({code: 13});
        } else {
            next();
        }
    } else {
        return next();
    }
};