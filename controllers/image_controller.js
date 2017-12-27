'use strict';

const db = require('../models');

/**
 *
 * Gets all events.
 *
 * @param {Object} req - the user request
 * @param {Object} res - the response to be sent
 * @param {Object} handle - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.index = function (req, res, handle) {
    return db.Event.findAll()
        .then((events) => res.json(events))
        .catch((err) => handle(err));
};

/*
 *
 * Gets a single event
 *
 * @param {Object} req - the user request
 * @param {Object} res - the response to be sent
 * @param {Object} handle - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.show = function (req, res, handle) {
    if (typeof req.params.eventId !== 'number') {

        throw res.boom.badRequest();
    }

    return db.Event.findOne({where: {id: req.params.eventId}})
        .then((event) => {
            if (event) {
                return res.status(200).json(event);
            }
            throw res.boom.notFound();

        })
        .catch((err) => handle(err));
};

/*
 *
 * Creates a new event and stores it
 *
 * @param {Object} req - the user request
 * @param {Object} res - the response to be sent
 * @param {Object} handle - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.store = function (req, res, handle) {
    if (typeof req.body.name !== 'string') {

        throw res.boom.badRequest();
    }

    /*
     * To lower case to avoid security problems
     * (users trying to create 'auTHOrs' group to gain rights)
     */
    req.body.name = req.body.name.toLowerCase();


    return db.Event.create(req.body)
        .then((event) => res.status(201).json(event))
        .catch((err) => {
            if (err instanceof db.Sequelize.ValidationError) {
                res.boom.badRequest(err);
            }
            throw err;
        })
        .catch((err) => handle(err));
};

/**
 *
 * Updates an existing event.
 *
 * @param {Object} req - the user request
 * @param {Object} res - the response to be sent
 * @param {Object} handle - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.update = function (req, res, handle) {
    if (typeof req.body.name !== 'string' ||
        typeof req.params.eventId !== 'number') {

        throw res.boom.badRequest();
    }

    /*
     * To lower case to avoid security problems
     * (users trying to create 'auTHOrs' group to gain rights)
     */
    req.body.name = req.body.name.toLowerCase();

    return db.Event.update(req.body, {where: {id: req.params.eventId}})
        .then(() => res.status(204).json({}))
        .catch(db.Sequelize.ValidationError, () => res.boom.badRequest())
        .catch((err) => handle(err));
};

/**
 *
 * Deletes an event.
 *
 * @param {Object} req - the user request
 * @param {Object} res - the response to be sent
 * @param {Object} handle - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.delete = function (req, res, handle) {
    if (typeof req.params.eventId !== 'number') {

        throw res.boom.badRequest();
    }

    return db.Event.destroy({where: {id: req.params.eventId}})
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
