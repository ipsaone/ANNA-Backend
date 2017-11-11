'use strict';

const db = require('../models');
const bcrypt = require('bcrypt');
const boom = require('boom');

exports.login = (req, res) => {
    db.User.findOne({where: {'username': req.body.username}, rejectOnEmpty: true})
        .then(user => {
            bcrypt.compare(req.body.password, user.password, (err, accept) => {
                if (err) throw err;

                if (accept) {
                    if (user.id) {
                        req.session.auth = user.id;
                        res.status(200);
                    } else {
                        throw boom.badImplementation();
                    }

                } else {
                    throw boom.unauthorized();
                }
            });

        })
};

exports.logout = (req, res) => {
    req.session.auth = null;
    res.status(200);
};

exports.check = (req, res) => {
    if (req.session.auth) {
        db.User.findOne({where: {id: req.session.auth}, rejectOnEmpty: true})
            .then(user => res.json({id: user.id, username: user.username}))
    }
    else {
        throw boom.unauthorized();
    }
};
