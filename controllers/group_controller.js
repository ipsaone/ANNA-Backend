'use strict';

/**
 * @file Manages groups
 * @see {@link module:group}
 */

/**
 * @module group
 */

const db = require('../models');

/**
 *
 * Get all existing groups.
 *
 * @function index
 *
 * @param {Object} req - the user request
 * @param {Object} res - the response to be sent
 * @param {Object} handle - the error handling function
 *
 * @returns {Object} promise
 *
 * @memberof module:group
 * @inner
 *
 */
exports.index = function (req, res, handle) {
    return db.Group.findAll({include: ['users']})
        .then((group) => res.json(group))
        .catch((err) => handle(err));
};

/**
 *
 * Get an existing group.
 *
 * @function show
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 * @param {Object} handle - The error handling function.
 *
 * @returns {Object} Promise.
 *
 * @memberof module:group
 * @inner
 *
 */
exports.show = function (req, res, handle) {
    if (isNaN(parseInt(req.params.groupId, 10))) {
        throw res.boom.badRequest();
    }
    const groupId = parseInt(req.params.groupId, 10);

    return db.Group.findOne({
        where: {id: groupId},
        include: ['users']
    })
        .then((group) => {
            if (group) {
                return res.status(200).json(group);
            }
            throw res.boom.notFound();

        })
        .catch((err) => handle(err));
};

/**
 *
 * Creates a new group and stores it.
 *
 * @function store
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 * @param {Object} handle - The error handling function.
 *
 * @returns {Object} Promise.
 *
 * @memberof module:group
 * @inner
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


    return db.Group.create(req.body)
        .then((group) => res.status(201).json(group))
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
 * Updates an existing group.
 *
 * @function update
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 * @param {Object} handle - The error handling function.
 *
 * @returns {Object} Promise.
 *
 * @memberof module:group
 * @inner
 *
 */
exports.update = function (req, res, handle) {
    if (typeof req.body.name !== 'string' || isNaN(parseInt(req.params.groupId, 10))) {
        throw res.boom.badRequest();
    }
    const groupId = parseInt(req.params.groupId, 10);

    /*
     * To lower case to avoid segroupty problems
     * (users trying to create 'auTHOrs' group to gain rights)
     */
    req.body.name = req.body.name.toLowerCase();

    return db.Group.update(req.body, {where: {id: groupId}})
        .then(() => res.status(204).json({}))
        .catch(db.Sequelize.ValidationError, () => res.boom.badRequest())
        .catch((err) => handle(err));
};

/**
 *
 * Deletes an existing group.
 *
 * @function delete
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 * @param {Object} handle - The error handling function.
 *
 * @returns {Object} Promise.
 *
 * @memberof module:group
 * @inner
 *
 */
exports.delete = function (req, res, handle) {
    if (typeof req.body.name !== 'string' || isNaN(parseInt(req.params.groupId, 10))) {
        throw res.boom.badRequest();
    }
    const groupId = parseInt(req.params.groupId, 10);

    return db.Group.destroy({where: {id: groupId}})
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
