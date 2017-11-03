'use strict';

const config = require('../config/config');

module.exports = (req, res, next) => {
    if (req.url !== '/' && req.url !== '/auth/login' && req.url !== '/auth/check') {
        if (req.session.auth || config.session.check === "false") {
            return next();
        } else {
            return res.status(401).send({code: 13});
        }
    } else {
        return next();
    }
};