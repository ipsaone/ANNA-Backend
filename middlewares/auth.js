'use strict';

const config = require('../config/config');

module.exports = (req, res, next) => {
    if (req.url !== '/' && req.url !== '/login') {
        if (typeof(req.session.userId) === 'undefined' && config.session.check) {
            return res.json({code: 13});
        }
    } else {
        return next();
    }
};