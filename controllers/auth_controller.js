'use strict';

const db = require('../models');
const bcrypt = require('bcrypt');

exports.login = (req, res, handle) => {
    db.User.findOne({where: {'username': req.body.username}, include: ['groups']})
        .then(user => {
            if (!user) {
                throw res.boom.notFound();
            }

            bcrypt.compare(req.body.password, user.password, (err, accept) => {
                if (err) {
                    throw err;
                }

                if (accept) {
                    if (user.id) {
                        req.session.auth = user.id;
                        res.status(200).json({id: user.id, username: user.username, groups: user.groups});
                    } else {
                        throw res.boom.badImplementation('User ID isn\'t defined');
                    }

                } else {
                    throw res.boom.unauthorized();
                }
            });
        })
        .catch(err => handle(err));
};

exports.logout = (req, res, handle) => {
    req.session.auth = null;
    res.status(200).json({});
};

exports.check = (req, res, handle) => {
    if (req.session.auth) {
        db.User.findOne({where: {id: req.session.auth}, include: ['groups']})
            .then(user => {
                if (!user) {
                    throw res.boom.notFound();
                }

                else {
                    res.json({id: user.id, username: user.username, groups: user.groups});
                }
            })
            .catch(err => handle(err));
    }
    else {
        throw res.boom.unauthorized();
    }
};
