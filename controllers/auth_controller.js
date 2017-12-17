'use strict';

const db = require('../models');
const bcrypt = require('bcrypt');

exports.login = (req, res, handle) => {
    db.User.findOne({
        where: {'username': req.body.username},
        include: ['groups']
    })
        .then((user) => {
            if (!user) {
                throw res.boom.notFound('Bad username');
            }

            return user;
        })
        .then((user) =>
            bcrypt.compare(req.body.password, user.password)
            // Check password
                .then((accept) => {
                    if (!accept) {
                        throw res.boom.unauthorized('Bad password');
                    }

                    return true;
                })
            // Set user session variables
                .then(() => {
                    req.session.auth = user.id;

                    return true;
                })
            // Send response
                .then(() => res.status(200).json({
                    id: user.id,
                    username: user.username,
                    groups: user.groups
                })))
        .catch((err) => handle(err));
};

exports.logout = (req, res) => {
    req.session.auth = null;
    res.status(200).json({});
};

exports.check = (req, res, handle) => {
    if (req.session.auth) {
        db.User.findOne({
            where: {id: req.session.auth},
            include: ['groups']
        })
            .then((user) => {
                if (user) {
                    return res.json({
                        id: user.id,
                        username: user.username,
                        groups: user.groups
                    });

                }
                throw res.boom.notFound();

            })
            .catch((err) => handle(err));
    } else {
        throw res.boom.unauthorized();
    }
};
