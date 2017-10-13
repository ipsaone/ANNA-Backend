'use strict';

const db = require('../models');
const bcrypt = require('bcryptjs');

exports.login = function (req, res) {
    db.User.findOne({where: {'username': req.body.username}})
        .then(user => {
            if (!user) { // If user not found
                res.statusCode = 404;
                res.json({accept: false, code: 23});
            } else {
                if (bcrypt.compareSync(req.body.password, user.password)) {
                    req.session.userId = user.id;
                    res.statusCode = 200;
                    res.json({accept: true, code: 0});
                } else { // Passwords don't match
                    res.statusCode = 400;
                    res.json({accept: false, code: 11});
                }
            }
        })
        .catch(err => {
            res.statusCode = 400;
            res.json({code: 31, message: err.message});
        });
};

exports.logout = function (req, res) {
    req.session.userId = undefined;
    res.statusCode = 200;
    res.json({});
};