'use strict';

/**
 * @file Manages missions
 * @see {@link module:mission}
 */

/**
 * @module mission
 */

const db = require('../models');

/**
 *
 * Get all existing missions.
 *
 * @function index
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 * @param {Object} handle - The error handling function.
 *
 * @returns {Object} promise
 *
 * @memberof module:mission
 * @inner
 *
 */
exports.index = function (req, res, handle) {
    return db.Missions.findAll()
        .then((missions) => res.status(200).json(missions))
        .catch((err) => handle(err));
};

/**
 *
 * Get a single mission.
 *
 * @function show
 *
 * @param {Object} req - the user request
 * @param {Object} res - the response to be sent
 * @param {Object} handle - the error handling function
 *
 * @returns {Object} promise
 *
 * @memberof module:mission
 * @inner
 *
 */
exports.show = function (req, res, handle) {
    if (typeof req.params.missionId !== 'number') {

        throw res.boom.badRequest();
    }


    return db.Missions.findOne({
        where: {id: req.params.missionId},
        rejectOnEmpty: true
    })
        .then((mission) => {
            if (mission) {
                return res.status(200).json(mission);
            }
            throw res.boom.notFound();

        })
        .catch((err) => handle(err));
};

/**
 *
 * Create and store a new mission.
 *
 * @function store
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 * @param {Object} handle - the error handling function
 *
 * @returns {Object} promise
 *
 * @memberof module:mission
 * @inner
 *
 */
exports.store = function (req, res, handle) {
    return db.Missions.create(req.body)
        .then((mission) => res.status(201).json(mission))
        .catch(db.Sequelize.ValidationError, () => res.boom.badRequest())
        .catch((err) => handle(err));
};

/**
 *
 * Updates an existing mission.
 *
 * @function update
 *
 * @param {obj} req     - The user request.
 * @param {obj} res     - The response to be sent.
 * @param {obj} handle  - The error handling function.
 *
 * @returns {Object} Promise.
 *
 * @memberof module:mission
 * @inner
 *
 */
exports.update = function (req, res, handle) {
    if (typeof req.params.missionId !== 'number') {

        return handle(res.boom.badRequest());
    }

    return db.Missions.update(req.body, {where: {id: req.params.missionId}})
        .then(() => res.status(204).json({}))
        .catch(db.Sequelize.ValidationError, () => res.boom.badRequest())
        .catch((err) => handle(err));
};

/**
 *
 * Delete an existing mission.
 *
 * @function delete
 *
 * @param {obj} req     - the user request
 * @param {obj} res     - the response to be sent
 * @param {obj} handle  - the error handling function
 *
 * @returns {Object} promise
 *
 * @memberof module:mission
 * @inner
 *
 */
exports.delete = function (req, res, handle) {
    if (typeof req.params.missionId !== 'number') {

        throw res.boom.badRequest();
    }

    return db.Missions.destroy({where: {id: req.params.missionId}})
        .then(() => res.status(204).json({}))
        .catch((err) => handle(err));
};
