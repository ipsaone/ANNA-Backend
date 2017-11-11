'use strict';

const db = require('../models');
const boom = require('boom');

exports.index = function (req, res, handle) {
    db.Missions.findAll()
        .then(missions => res.status(200).json(missions))
        .catch(err => handle(err));
};

exports.show = function (req, res, handle) {
    db.Missions.findOne({where: {id: req.params.missionId}, rejectOnEmpty: true})
        .then(mission => {
            if (!mission) { return handle(boom.notFound()); }

            else {
                res.status(200).json(post);
            }
        })
        .catch(err => handle(err));
};

exports.store = function (req, res, handle) {
    db.Missions.create(req.body)
        .then(mission => res.status(201).json(mission))
        .catch(err => handle(err));
};

exports.update = function (req, res, handle) {
    db.Missions.update(req.body, {where: {id: req.params.missionId}})
        .then(() => res.status(204).json({}))
        .catch(err => handle(err));
};

exports.delete = function (req, res, handle) {
    db.Missions.destroy({where: {id: req.params.missionId}})
        .then(() => res.status(204))
        .catch(err => handle(err));
};
