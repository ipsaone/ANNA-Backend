'use strict';

module.exports = (req, res, next) => {
    if (req.url !== '/' && req.url !== '/login') {
        if (typeof(req.session.userId) === 'undefined') {
            res.json({code: 13});
        }
    } else {
        next();
    }
};