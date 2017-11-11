'use strict';

const db = require('../models');
const boom = require('boom');

exports.index = function (req, res) {
    db.Group.findAll({include: ['users']})
        .then(group => res.json(group))
};

exports.show = function (req, res) {
    db.Group.findOne({where: {id: req.params.groupId}, include: ['users']})
        .then(group => {
            if (!group) {
                throw boom.notFound()
            }
            else {
                res.json(group);
            }
        })
};

exports.store = function (req, res) {
    db.Group.create(req.body)
        .then(group => {
            res.statusCode = 201;
            res.json(group);
        })
};

exports.update = function (req, res) {
    db.Group.update(req.body, {where: {id: req.params.groupId}})
        .then(result => {
            res.statusCode = 204;
            res.json({});
        })
};

exports.delete = function (req, res) {
    db.Group.destroy({where: {id: req.params.groupId}})
        .then(() => {
            res.statusCode = 204;
            res.json({});
        })
};
