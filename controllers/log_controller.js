'use strict';

/**
 * @file Manages logs
 * @see {@link module:log}
 */

/**
 * @module log
 */

const db = require('../models');
const policy = require('../policies/log_policy');

/**
 *
 * Get all existing logs.
 *
 * @function index
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 * @param {Object} handle - The error handling function.
 *
 * @returns {Object} Promise.
 *
 * @memberof module:log
 * @inner
 *
 */
exports.index = function (req, res, handle) {
    return db.Log.findAll({include: ['author']})
        .then((logs) => policy.filterIndex(logs, req.session.auth))
        .then((logs) => res.status(200).json(logs))
        .catch((err) => handle(err));
};

/**
 *
 * Get a single log.
 *
 * @function show
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 * @param {Object} handle - The error handling function.
 *
 * @returns {Object} Promise.
 *
 * @memberof module:log
 * @inner
 *
 */
exports.show = function (req, res, handle) {
    if (isNaN(parseInt(req.params.logId, 10))) {
        throw res.boom.badRequest();
    }
    const logId = parseInt(req.params.logId, 10);

    return db.Log.findOne({
        where: {id: logId},
        include: [
            'author',
            'files',
            'helpers'
        ]
    })
        .then((log) => policy.filterShow(log, req.session.auth))
        .then((log) => {
            if (log) {
                return res.status(200).json(log);
            }
            throw res.boom.notFound();

        })
        .catch((err) => handle(err));
};

/**
 *
 * Create a new log and store it.
 *
 * @function store
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 * @param {Object} handle - The error handling function.
 *
 * @returns {Object} Promise.
 *
 * @memberof module:log
 * @inner
 *
 */
exports.store = function (req, res, handle) {
    return policy.filterStore(req.body, req.session.auth)
        .then((builder) => db.Log.create(builder))
        .then((log) => res.status(201).json(log))
        .catch((err) => {
            if (err instanceof db.Sequelize.ValidationError) {
                res.boom.badRequest(err);
            }
            throw err;
        })
        .catch((err) => handle(err));
};

/**
 *LOg
 * Updates an existing log.
 *
 * @function update
 *
 * @param {obj} req     - the user request
 * @param {obj} res     - the response to be sent
 * @param {obj} handle  - the error handling function
 *
 * @returns {Object} promise
 *
 * @memberof module:log
 * @inner
 *
 */
exports.update = function (req, res, handle) {
    if (isNaN(parseInt(req.params.logId, 10))) {
        throw res.boom.badRequest();
    }
    const logId = parseInt(req.params.logId, 10);

    return policy.filterUpdate(req.body, logId, req.session.auth)
        .then((builder) => db.Log.update(builder, {where: {id: logId}}))
        .then(() => res.status(204).json({}))
        .catch((err) => handle(err));
};

/**
 *
 * Deletes an existing log.
 *
 *@Function delete.
 *
 * @param {obj} req     - The user request.
 * @param {obj} res     - The response to be sent.
 * @param {obj} handle  - The error handling function.
 *
 * @returns {Object} Promise.
 *
 * @memberof module:log
 * @inner
 *
 */
exports.delete = function (req, res, handle) {
    if (typeof req.params.logId !== 'string' || isNaN(parseInt(req.params.logId, 10))) {
        throw res.boom.badRequest();
    }
    const logId = parseInt(req.params.logId, 10);

    return policy.filterDelete(req.session.auth)
        .then(() => db.Log.destroy({where: {id: logId}}))
        .then((data) => {
            if (data === 1) {
                return res.status(204).json({});
            } else if (data === 0) {
                throw res.boom.notFound();
            } else {
                throw res.boom.badImplementation('Too many rows deleted !');
            }
        })
        .catch((err) => handle(err));
};
