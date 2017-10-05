'use strict';

const db = require('../models');

exports.index = function (req, res) {
    db.Log.findAll({include: ['author']})
        .then(logs => {
            res.statusCode = 200;
            res.json(logs);
        })
        .catch(err => {
            res.statusCode = 400;
            res.json({code: 31, message: err.message});
        });
};

exports.show = function (req, res) {
    db.Log.findOne({where: {id: req.params.logId}, include: ['author']})
        .then(log => {
            if (!log) {
                res.statusCode = 404;
                res.json({code: 23});
            }
            else {
                res.statusCode = 200;
                res.json(log);
            }
        })
        .catch(err => {
            res.statusCode = 400;
            res.json({code: 31, message: err.message});
        });
};

exports.store = function (req, res) {
    db.Log.create(req.body)
        .then(log => {
            res.statusCode = 201;
            res.json(log);
        })
        .catch(err => {
            res.statusCode = 400;
            res.json({code: 31, message: err.message});
        });
};

exports.update = function (req, res) {
    db.Log.update(req.body, {where: {id: req.params.logId}})
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
    db.Log.destroy({where: {id: req.params.logId}})
        .then(() => {
            res.statusCode = 204;
            res.json({});
        })
        .catch(err => {
            res.statusCode = 400;
            res.json({code: 31, message: err.message});
        });
};