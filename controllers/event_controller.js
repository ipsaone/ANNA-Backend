'use strict';

const db = require('../models');
const policy = require('../policies/event_policy.js');

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
exports.index = async function (req, res) {
    const authorized = policy.filterIndex();

    if (!authorized) {
        return false;
    }

    const events = await db.Event.findAll();


    return res.json(events);
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
exports.show = async function (req, res) {
    if (isNaN(parseInt(req.params.eventId, 10))) {
        throw res.boom.badRequest();
    }
    const eventId = parseInt(req.params.eventId, 10);

    const event = await db.Event.findById(eventId);

    if (!event) {
        throw res.boom.notFound();
    }


    const filtered = await policy.filterShow(event, req.session.id);

    if (!filtered) {
        throw res.boom.unauthorized();
    }

    return res.status(200).json(filtered);
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
exports.store = async function (req, res) {
    if (typeof req.body.name !== 'string') {
        throw res.boom.badRequest();
    }

    /*
     * To lower case to avoid security problems
     * (users trying to create 'auTHOrs' group to gain rights)
     */
    req.body.name = req.body.name.toLowerCase();


    const authorized = policy.filterStore(req.session.auth);

    if (!authorized) {
        throw res.boom.unauthorized();
    }
    try {
        const event = await db.Event.create(req.body);

        return res.status(201).json(event);

    } catch (err) {
        if (err instanceof db.Sequelize.ValidationError) {
            throw res.boom.badRequest();
        }

        // Send to standard error handler
        throw err;
    }


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
exports.update = async function (req, res) {
    if (isNaN(parseInt(req.params.eventId, 10))) {
        throw res.boom.badRequest();
    }
    const eventId = parseInt(req.params.eventId, 10);

    /*
     * To lower case to avoid security problems
     * (users trying to create 'auTHOrs' group to gain rights)
     */
    req.body.name = req.body.name.toLowerCase();

    const authorized = await policy.filterUpdate(req.session.auth);

    if (!authorized) {
        throw res.boom.unauthorized();
    }

    try {
        await db.Event.update(req.body, {where: {id: eventId}});

        return res.status(204).json({});

    } catch (err) {
        if (err instanceof db.Sequelize.ValidationError) {
            throw res.boom.badRequest(err);
        }
        throw err;
    }


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
exports.delete = async function (req, res) {
    if (isNaN(parseInt(req.params.eventId, 10))) {
        res.boom.badRequest();

        return;
    }
    const eventId = parseInt(req.params.eventId, 10);

    const authorized = await policy.filterDelete(req.session.auth);

    if (!authorized) {
        res.boom.unauthorized();

        return;
    }

    const event = await db.Event.findById(eventId);

    if (!event) {
        res.boom.notFound();

        return;
    }

    await event.destroy();

    return res.status(204).json({});

};

exports.storeRegistered = async function (req, res) {
    if (isNaN(parseInt(req.params.eventId, 10))) {
        throw res.boom.badRequest();
    }
    const eventId = parseInt(req.params.eventId, 10);

    if (isNaN(parseInt(req.params.userId, 10))) {
        throw res.boom.badRequest();
    }
    const userId = parseInt(req.params.userId, 10);

    const allowed = await policy.filterStoreRegistered(eventId, userId, req.session.auth);

    if (!allowed) {
        throw res.boom.unauthorized();
    }

    const event = await db.Event.findById(eventId);

    await event.addRegistered(userId);

    return res.status(201).json({});
};

exports.deleteRegistered = async function (req, res) {
    if (isNaN(parseInt(req.params.eventId, 10))) {
        throw res.boom.badRequest();
    }
    const eventId = parseInt(req.params.eventId, 10);

    if (isNaN(parseInt(req.params.userId, 10))) {
        throw res.boom.badRequest();
    }
    const userId = parseInt(req.params.userId, 10);


    const allowed = await policy.filterDeleteRegistered(eventId, userId, req.session.auth);

    if (!allowed) {
        throw res.boom.unauthorized();
    }

    const event = await db.Event.findById(eventId);

    await event.removeRegistered(userId);

    return res.status(201).json({});

};
