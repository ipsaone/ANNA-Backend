'use strict';

const db = require('../models');

exports.index = function (req, res, handle) {
    db.Group.findAll({include: ['users']})
        .then(group => res.json(group))
        .catch(err => handle(err));
};

exports.show = function (req, res, handle) {
    db.Group.findOne({where: {id: req.params.groupId}, include: ['users']})
        .then(group => {
            if (!group) { res.boom.notFound(); }

            else {
                res.json(group);
            }
        })
        .catch(err => handle(err));
};

exports.store = function (req, res, handle) {
    db.Group.create(req.body)
        .then(group => res.status(201).json(group))
        .catch(err => handle(err));
};

exports.update = function (req, res, handle) {
    db.Group.update(req.body, {where: {id: req.params.groupId}})
        .then(result => res.status(204))
        .catch(err => handle(err));
};

exports.delete = function (req, res, handle) {
    db.Group.destroy({where: {id: req.params.groupId}})
        .then(() => res.status(204))
        .catch(err => handle(err));
};
