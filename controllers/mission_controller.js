'use strict';

const db = require('../models');
const policy = require('../policies/mission_policy');

/**
 *
 * Get all existing missions.
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 * @param {Object} handle - The error handling function.
 *
 * @returns {Object} Promise.
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
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 * @param {Object} handle - The error handling function.
 *
 * @returns {Object} Promise.
 *
 */
exports.show = function (req, res, handle) {
    if (isNaN(parseInt(req.params.missionId, 10))) {
        throw res.boom.badRequest();
    }
    const missionId = parseInt(req.params.missionId, 10);

    return policy.filterShow()
        .then(() => db.Mission.findOne({where: {id: missionId}}))
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
 * @param {Object} req - The user request.
 * @param {Object} res - the response to be sent
 * @param {Object} handle - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.store = function (req, res, handle) {
    return policy.filterStore(req.session.auth)
        .then(() => db.Mission.create(req.body))
        .then((mission) => res.status(201).json(mission))
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
 * Updates an existing mission.
 *
 * @param {obj} req     - The user request.
 * @param {obj} res     - The response to be sent.
 * @param {obj} handle  - The error handling function.
 *
 * @returns {Object} Promise.
 *
 */
exports.update = function (req, res, handle) {
    if (isNaN(parseInt(req.params.missionId, 10))) {
        throw res.boom.badRequest();
    }
    const missionId = parseInt(req.params.missionId, 10);

    return policy.filterUpdate(req.session.auth)
        .then(() => db.Missions.update(req.body, {where: {id: missionId}}))
        .then(() => res.status(204).json({}))
        .catch(db.Sequelize.ValidationError, () => res.boom.badRequest())
        .catch((err) => handle(err));
};

/**
 *
 * Delete an existing mission.
 *
 * @param {obj} req     the user request
 * @param {obj} res     - the response to be sent
 * @param {obj} handle  - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.delete = function (req, res, handle) {
    if (isNaN(parseInt(req.params.missionId, 10))) {
        throw res.boom.badRequest();
    }
    const missionId = parseInt(req.params.missionId, 10);

    return policy.filterDelete(req.session.auth)
        .then(() => db.Missions.destroy({where: {id: missionId}}))
        .then(() => res.status(204).json({}))
        .catch((err) => handle(err));
};


exports.showTask = async function (req, res) {
    // Check mission ID
    if (isNaN(parseInt(req.params.missionId, 10))) {
        throw res.boom.badRequest();
    }
    const missionId = parseInt(req.params.missionId, 10);

    // Check task ID
    if (isNaN(parseInt(req.params.taskId, 10))) {
        throw res.boom.badRequest();
    }
    const taskId = parseInt(req.params.taskId, 10);

    // Check mission and task are associated
    const task = await db.Task.findById(taskId);

    if (!task.missionId === missionId) {
        throw res.boom.badRequest();
    }

    // Check user has permissions to see the task
    const allowed = policy.filterShowTask(req.session.auth);

    if (!allowed) {
        throw res.boom.unauthorized();
    }

    // Delete the task and answer accordingly
    await res.status(204).json(task);
};

// --- TODO ---
exports.updateTask = async function (req, res) {
    if (isNaN(parseInt(req.params.missionId, 10))) {
        throw res.boom.badRequest();
    }
    const missionId = parseInt(req.params.missionId, 10);

    /*
     * If (isNaN(parseInt(req.params.taskId, 10))) {
     * throw res.boom.badRequest();
     * }
     * const taskId = parseInt(req.params.taskId, 10);
     */


    const mission = await db.Mission.findById(missionId);

    await res.status(200).json(mission);
};

// --- TODO ---
exports.storeTask = async function (req, res) {
    if (isNaN(parseInt(req.params.missionId, 10))) {
        throw res.boom.badRequest();
    }
    const missionId = parseInt(req.params.missionId, 10);

    /*
     * If (isNaN(parseInt(req.params.taskId, 10))) {
     * throw res.boom.badRequest();
     * }
     * const taskId = parseInt(req.params.taskId, 10);
     */


    const mission = await db.Mission.findById(missionId);

    await res.status(200).json(mission);
};

exports.deleteTask = async function (req, res) {

    // Check mission ID
    if (isNaN(parseInt(req.params.missionId, 10))) {
        throw res.boom.badRequest();
    }
    const missionId = parseInt(req.params.missionId, 10);

    // Check task ID
    if (isNaN(parseInt(req.params.taskId, 10))) {
        throw res.boom.badRequest();
    }
    const taskId = parseInt(req.params.taskId, 10);

    // Check mission and task are associated
    const task = await db.Task.findById(taskId);

    if (!task.missionId === missionId) {
        throw res.boom.badRequest();
    }

    // Check user has permissions to delete the task
    const allowed = policy.filterDeleteTask(req.session.auth);

    if (!allowed) {
        throw res.boom.unauthorized();
    }

    // Delete the task and answer accordingly
    await task.destroy();
    await res.status(204).json({});


};
