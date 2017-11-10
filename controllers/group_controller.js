'use strict';

const db = require('../models');

exports.index = function (req, res) {
    db.Group.findAll({include: ['users']})
        .then(group => {
            res.statusCode = 200;
            res.json(group);
        })
        .catch(err => {
            res.statusCode = 400;
            res.json({code: 31, message: err.message});
        });
};

exports.show = function (req, res) {
    db.Group.findOne({where: {id: req.params.groupId}, include: ['users']})
        .then(group => {
            if (!group) {
                res.statusCode = 404;
                res.json({code: 23});
            }
            else {
                res.statusCode = 200;
                res.json(group);
            }
        })
        .catch(err => {
            res.statusCode = 400;
            res.json({code: 31, message: err.message});
        });
};

exports.store = function (req, res) {

    // To lower case to avoid security problems 
    // (users trying to create 'auTHOrs' group to gain rights)
    if(typeof(req.body.name) !== 'undefined') {
        req.body.name = toLowerCase(req.body.name)
    }


    db.Group.create(req.body)
        .then(group => {
            res.statusCode = 201;
            res.json(group);
        })
        .catch(err => {
            res.statusCode = 400;
            res.json({code: 31, message: err.message});
        });
};

exports.update = function (req, res) {
    db.Group.update(req.body, {where: {id: req.params.groupId}})
        .then(result => {
            res.statusCode = 204;
            res.json({});
        })
        .catch(err => {
            res.statusCode = 400;
            res.json({code: 31, message: err.message});
        });
};

exports.delete = function (req, res) {
    db.Group.destroy({where: {id: req.params.groupId}})
        .then(() => {
            res.statusCode = 204;
            res.json({});
        })
        .catch(err => {
            res.statusCode = 400;
            res.json({code: 31, message: err.message});
        });
};