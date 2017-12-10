'use strict';

const db = require('../models');

exports.index = function (req, res, handle) {
    db.Event.findAll()
        .then((events) => res.json(events))
        .catch((err) => handle(err));
};

exports.show = function (req, res, handle) {
    db.Event.findOne({where: {id: req.params.eventId}})
        .then((event) => {
            if (event) {
                return res.status(200).json(event);
            }
            throw res.boom.notFound();

        })
        .catch((err) => handle(err));
};

exports.store = function (req, res, handle) {

    /*
     * To lower case to avoid security problems
     * (users trying to create 'auTHOrs' group to gain rights)
     */
    if (typeof req.body.name !== 'undefined') {
        req.body.name = req.body.name.toLowerCase();
    }


    db.Event.create(req.body)
        .then((event) => res.status(201).json(event))
        .catch(db.Sequelize.ValidationError, () => res.boom.badRequest())
        .catch((err) => handle(err));
};

exports.update = function (req, res, handle) {

    /*
     * To lower case to avoid security problems
     * (users trying to create 'auTHOrs' group to gain rights)
     */
    if (typeof req.body.name !== 'undefined') {
        req.body.name = req.body.name.toLowerCase();
    }

    db.Event.update(req.body, {where: {id: req.params.eventId}})
        .then(() => res.status(204).json({}))
        .catch(db.Sequelize.ValidationError, () => res.boom.badRequest())
        .catch((err) => handle(err));
};

exports.delete = function (req, res, handle) {
    db.Event.destroy({where: {id: req.params.eventId}})
        .then((data) => {

            /*
             *Data :
             * [0] : number of rows corresponding to request
             * [1] : number of affected rows
             */

            if (!data[0]) {
                throw res.boom.badImplementation('Missing data !');
            }

            if (data[0] === 1) {
                return res.status(204).json({});
            } else if (data[0] === 0) {
                throw res.boom.notFound();
            } else {
                throw res.boom.badImplementation('Too many rows deleted !');
            }
        })
        .catch((err) => handle(err));
};
