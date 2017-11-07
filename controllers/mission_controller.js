'use strict';

const db = require('../models');

exports.index = function (req, res) {
    db.Missions.findAll()
        .then(missions => {
            res.statusCode = 200;
            res.json(missions);
        })
        .catch(err => {
            res.statusCode = 400;
            res.json({code: 31, message: err.message});
        });
};

exports.show = function (req, res) {
    db.Missions.findOne({where: {id: req.params.missionId}, rejectOnEmpty: true})
        .then(mission => {
            if (!mission) {
                res.statusCode = 404;
                res.json({code: 23});
            }
            else {
                res.statusCode = 200;
                res.json(post);
            }
        })
        .catch(err => {
            res.statusCode = 404;
            res.json({code: 31, message: err.message});
        });
};

exports.store = function (req, res) {
    db.Missions.create(req.body)
        .then(mission => {
            res.statusCode = 201;
            res.json(mission);
        })
        .catch(err => {
            res.statusCode = 400;
            res.json({code: 31, message: err.message});
        });
};

exports.update = function (req, res) {
    db.Missions.update(req.body, {where: {id: req.params.missionId}})
        .then(() => {
            res.statusCode = 204;
            res.json({});
        })
        .catch(err => {
            res.statusCode = 400;
            res.json({code: 31, message: err.message});
        });
};

exports.delete = function (req, res) {
    db.Missions.destroy({where: {id: req.params.missionId}})
        .then(() => {
            res.statusCode = 204;
            res.json({});
        })
        .catch(err => {
            res.statusCode = 400;
            res.json({code: 31, message: err.message});
        });
};