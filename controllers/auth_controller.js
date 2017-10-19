'use strict';

const db = require('../models');
const bcrypt = require('bcrypt');

exports.login = (req, res) => {
    db.User.findOne({where: {'username': req.body.username}, rejectOnEmpty: true})
        .then(user => {

            bcrypt.compare(req.body.password, user.password, (err, accept) => {
                if (err) throw err;

                if (user.id)
                    req.session.userID = user.id;
                res.statusCode = (accept) ? 200 : 400;
                res.json({accept: accept, code: (accept) ? 0 : 11});
            });

        })
        .catch(err => {
            res.statusCode = 404;
            res.json({code: 31, message: err.message});
        });
};

exports.logout = (req, res) => {
    req.session.userId = null;
    res.statusCode = 200;
    res.json({});
};