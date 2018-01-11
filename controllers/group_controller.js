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
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 * @memberof module:group
 * @inner
 *
 */
exports.index = async function (req, res) {
    const groups = await db.Group.findAll({include: ['users']});

    return res.json(groups);
};

/**
 *
 * Get an existing group.
 *
 * @function show
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 * @memberof module:group
 * @inner
 *
 */
exports.show = async function (req, res) {
    if (isNaN(parseInt(req.params.groupId, 10))) {
        throw res.boom.badRequest();
    }
    const groupId = parseInt(req.params.groupId, 10);


    const group = await db.Group.findOne({
        where: {id: groupId},
        include: ['users']
    });

    if (!group) {
        throw res.boom.notFound();
    }

    return res.status(200).json(group);
};

/**
 *
 * Creates a new group and stores it.
 *
 * @function store
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 * @memberof module:group
 * @inner
 *
 */
exports.store = async function (req, res) {
    if (typeof req.body.name !== 'string') {

        throw res.boom.badRequest();
    }

    /*
     * To lower case to avoid security problems
     * (users trying to create 'auTHOrs' group to gain rights)
     */
    req.body.name = req.body.name.toLowerCase();

    const group = await db.Group.create(req.body);

    try {
        res.status(201).json(group);
    } catch (err) {
        if (err instanceof db.Sequelize.ValidationError) {
            throw res.boom.badRequest(err);
        }

        throw err;
    }
};

/**
 *
 * Updates an existing group.
 *
 * @function update
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 * @memberof module:group
 * @inner
 *
 */
exports.update = async function (req, res) {
    if (typeof req.body.name !== 'string' || isNaN(parseInt(req.params.groupId, 10))) {
        throw res.boom.badRequest();
    }
    const groupId = parseInt(req.params.groupId, 10);

    /*
     * To lower case to avoid segroupty problems
     * (users trying to create 'auTHOrs' group to gain rights)
     */
    req.body.name = req.body.name.toLowerCase();

    try {
        await db.Group.update(req.body, {where: {id: groupId}});

        return res.status(204).json({});
    } catch (err) {
        if (err instanceof db.Sequelize.ValidationError) {
            throw res.boom.badRequest();
        }
        throw err;
    }
};

/**
 *
 * Deletes an existing group.
 *
 * @function delete
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 * @memberof module:group
 * @inner
 *
 */
exports.delete = async function (req, res) {
    if (typeof req.body.name !== 'string' || isNaN(parseInt(req.params.groupId, 10))) {
        throw res.boom.badRequest();
    }
    const groupId = parseInt(req.params.groupId, 10);

    const group = await db.Group.findById(groupId);

    if (!group) {
        throw res.boom.notFound();
    }

    await group.destroy({where: {id: groupId}});

    return res.status(204).json({});

};
