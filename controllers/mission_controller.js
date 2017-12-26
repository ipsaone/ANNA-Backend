'use strict';

const db = require('../models');
const policy = require('../policies/mission_policy');

/**
 *
 * Get all existing missions.
 *
 * @param {Object} req - the user request
 * @param {Object} res - the response to be sent
 * @param {Object} handle - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.index = (req, res, handle) =>
    policy.filterIndex()
        .then(() => db.Mission.findAll())
        .then((missions) => res.status(200).json(missions))
        .catch((err) => handle(err));

/**
 *
 * Get a single mission.
 *
 * @param {Object} req - the user request
 * @param {Object} res - the response to be sent
 * @param {Object} handle - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.show = function (req, res, handle) {
    if (isNaN(parseInt(req.params.missionId, 10))) {
        throw res.boom.badRequest();
    }
    const missionId = parseInt(req.params.missionId, 10);

    return policy.filterShow()
        .then(() => db.Missions.findOne({
            where: {id: missionId},
            rejectOnEmpty: true
        }))
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
 * @param {Object} req - the user request
 * @param {Object} res - the response to be sent
 * @param {Object} handle - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.store = function (req, res, handle) {
    return policy.filterStore()
        .then(() => db.Missions.create(req.body))
        .then((mission) => res.status(201).json(mission))
        .catch(db.Sequelize.ValidationError, () => res.boom.badRequest())
        .catch((err) => handle(err));
};

/**
 *
 * Updates an existing mission.
 *
 * @param {obj} req     the user request
 * @param {obj} res     the response to be sent
 * @param {obj} handle  - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.update = function (req, res, handle) {
    if (typeof req.params.missionId !== 'number') {

        return handle(res.boom.badRequest());
    }

    return policy.filterUpdate()
        .then(() => db.Missions.update(req.body, {where: {id: req.params.missionId}}))
        .then(() => res.status(204).json({}))
        .catch(db.Sequelize.ValidationError, () => res.boom.badRequest())
        .catch((err) => handle(err));
};

/**
 *
 * Delete an existing mission.
 *
 * @param {obj} req     the user request
 * @param {obj} res     the response to be sent
 * @param {obj} handle  - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.delete = function (req, res, handle) {
    if (typeof req.params.missionId !== 'number') {

        throw res.boom.badRequest();
    }

    return policy.filterDelete()
        .then(() => db.Missions.destroy({where: {id: req.params.missionId}}))
        .then(() => res.status(204).json({}))
        .catch((err) => handle(err));
};
