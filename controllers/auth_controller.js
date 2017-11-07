'use strict';

const db = require('../models');
const bcrypt = require('bcrypt');

exports.login = (req, res) => {  
    db.User.findOne({where: {'username': req.body.username}, rejectOnEmpty: true})
        .then(user => {
            bcrypt.compare(req.body.password, user.password, (err, accept) => {
                if (err) throw err;

                if (user.id)
                    req.session.auth = user.id;
                res.statusCode = (accept) ? 200 : 400;
                res.json({accept: accept, code: (accept) ? 0 : 11, username: user.username, id: user.id});
            });

        })
        .catch(err => {
            res.statusCode = 404;
            res.json({code: 31, message: err.message});
        });
};

exports.logout = (req, res) => {
    req.session.auth = null;
    res.statusCode = 200;
    res.json({});
};

exports.check = (req, res) => {
    if (req.session.auth) {
        db.User.findOne({where: {id: req.session.auth}, rejectOnEmpty: true})
            .then(user => {
                res.statusCode = 200;
                res.json({id: user.id, username: user.username});
            })
            .catch(err => {
                res.statusCode = 400;
                res.json({});
            });
    }
    else {
        res.statusCode = 400;
        res.json({});
    }
};