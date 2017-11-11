'use strict';

const db = require('../models');
const boom = require('boom');

exports.index = function (req, res, handle) {
    db.Log.findAll({include: ['author']})
        .then(logs => {
            res.status(200).json(logs);
        })
        .catch(err => handle(err));
};

exports.show = function (req, res, handle) {
    db.Log.findOne({where: {id: req.params.logId}, include: ['author']})
        .then(log => {
            if (!log) { res.boom.notFound(); }

            else {
                res.status(200).json(log);
            }
        })
        .catch(err => handle(err));
};

exports.store = function (req, res, handle) {
    db.Log.create(req.body)
        .then(log => res.status(201).json(log))
        .catch(db.Sequelize.ValidationError, err => res.boom.badRequest())
        .catch(err => handle(err));
};

exports.update = function (req, res, handle) {
    db.Log.update(req.body, {where: {id: req.params.logId}})
        .then(result => res.status(204).json({}))
        .catch(err => handle(err));
};

exports.delete = function (req, res, handle) {
    db.Log.destroy({where: {id: req.params.logId}})
        .then(data => {
            if(!data[0]){ res.boom.badImplementation('Missing data !')}

            if(data[0] == 1) {
                res.status(204).json({})
            } else if(data[0] == 0) {
                res.boom.notFound();
            } else {
                res.boom.badImplementation('Too many rows deleted !');
            }
        })
        .catch(err => handle(err));
};
