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
exports.index = async (req, res) => {
    const authorized = await policy.filterIndex();

    if (!authorized) {
        return res.boom.unauthorized();
    }

    const missions = await db.Mission.findAll();


    return res.status(200).json(missions);
};

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
exports.show = async (req, res) => {
    if (isNaN(parseInt(req.params.missionId, 10))) {
        return res.boom.badRequest();
    }
    const missionId = parseInt(req.params.missionId, 10);

    const authorized = policy.filterShow();

    if (!authorized) {
        return req.boom.unauthorized();
    }

    const mission = await db.Mission.findOne({where: {id: missionId}});

    if (!mission) {
        return res.boom.notFound();
    }

    return res.status(200).json(mission);
};

/**
 *
 * Create and store a new mission.
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 * @param {Object} handle - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.store = async (req, res) => {

    const authorized = await policy.filterStore(req.session.auth);

    if (!authorized) {
        return res.boom.unauthorized();
    }

    try {
        const mission = await db.Mission.create(req.body);


        return res.status(200).json(mission);
    } catch (err) {
        if (err instanceof db.Sequelize.ValidationError) {
            return res.boom.badRequest();
        }

        return err;
    }
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
        return res.boom.badRequest();
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
 * @param {obj} req     the user request.
 * @param {obj} res     - The response to be sent.
 * @param {obj} handle  - The error handling function.
 *
 * @returns {Object} promise
 *
 */
exports.delete = function (req, res, handle) {
    if (isNaN(parseInt(req.params.missionId, 10))) {
        return res.boom.badRequest();
    }
    const missionId = parseInt(req.params.missionId, 10);

    return policy.filterDelete(req.session.auth)
        .then(() => db.Missions.destroy({where: {id: missionId}}))
        .then(() => res.status(204).json({}))
        .catch((err) => handle(err));
};

exports.indexTasks = async function (req, res) {
    // Check mission ID
    if (isNaN(parseInt(req.params.missionId, 10))) {
        return res.boom.badRequest();
    }
    const missionId = parseInt(req.params.missionId, 10);

    const mission = await db.Mission.findById(missionId);

    if (!mission) {
        return req.boom.notFound(`no mission with id ${missionId}`);
    }

    const tasks = await mission.getTasks();

    return res.status(200).json(tasks);
};

exports.showTask = async function (req, res) {
    // Check mission ID
    if (isNaN(parseInt(req.params.missionId, 10))) {
        return res.boom.badRequest();
    }
    const missionId = parseInt(req.params.missionId, 10);
    const mission = await db.Mission.findById(missionId);

    if (!mission) {
        return res.boom.notFound(`No mission with id ${missionId}`);
    }

    // Check task ID
    if (isNaN(parseInt(req.params.taskId, 10))) {
        return res.boom.badRequest();
    }
    const taskId = parseInt(req.params.taskId, 10);

    // Check mission and task are associated
    const task = await db.Task.findById(taskId);

    if (!task.missionId === missionId) {
        return res.boom.badRequest();
    }

    // Check user has permissions to see the task
    const allowed = policy.filterShowTask(req.session.auth);

    if (!allowed) {
        return res.boom.unauthorized();
    }

    // Delete the task and answer accordingly
    await res.status(204).json(task);
};

exports.updateTask = async function (req, res) {
    if (isNaN(parseInt(req.params.missionId, 10))) {
        return res.boom.badRequest();
    }
    const missionId = parseInt(req.params.missionId, 10);


    if (isNaN(parseInt(req.params.taskId, 10))) {
        return res.boom.badRequest();
    }
    const taskId = parseInt(req.params.taskId, 10);


    const mission = await db.Mission.findById(missionId);

    if (!mission) {
        return res.boom.notFound(`No mission with id ${missionId}`);
    }

    const task = await db.Task.findById(taskId);

    if (!task) {
        return res.boom.notFound(`No task with id ${taskId}`);
    }

    const updateContents = await policy.filterUpdateTask(req.body, req.session.auth);

    try {
        await task.update(updateContents);

        return res.status(200).json(task);
    } catch (err) {
        if (typeof err === db.Sequelize.ValidationError) {
            return res.boom.badRequest();
        }

        throw err;
    }

};

exports.storeTask = async function (req, res) {
    if (isNaN(parseInt(req.params.missionId, 10))) {
        return res.boom.badRequest();
    }
    const missionId = parseInt(req.params.missionId, 10);

    req.body.missionId = missionId;
    const mission = await db.Mission.findById(missionId);

    if (!mission) {
        return res.boom.notFound(`No mission with id ${missionId}`);
    }

    const authorized = await policy.filterStoreTask(req.session.auth);

    if (!authorized) {
        return res.boom.unauthorized();
    }


    try {
        const task = await db.Task.create(req.body);


        return res.status(200).json(task);
    } catch (err) {

        if (typeof err === db.Sequelize.ValidationError) {
            return res.boom.badRequest();
        }

        throw err;
    }


};

exports.deleteTask = async function (req, res) {

    // Check mission ID
    if (isNaN(parseInt(req.params.missionId, 10))) {
        return res.boom.badRequest();
    }
    const missionId = parseInt(req.params.missionId, 10);

    // Check task ID
    if (isNaN(parseInt(req.params.taskId, 10))) {
        return res.boom.badRequest();
    }
    const taskId = parseInt(req.params.taskId, 10);

    // Check mission and task are associated
    const task = await db.Task.findById(taskId);

    if (!task.missionId === missionId) {
        return res.boom.badRequest();
    }

    // Check user has permissions to delete the task
    const allowed = policy.filterDeleteTask(req.session.auth);

    if (!allowed) {
        return res.boom.unauthorized();
    }

    // Delete the task and answer accordingly
    await task.destroy();
    await res.status(204).json({});


};
