'use strict';

const db = require('../models');
const policy = require('../policies/event_policy.js');
const userPolicy = require('../policies/user_policy.js');

/**
 *
 * Gets all events.
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 * @param {Object} handle - The error handling function.
 *
 * @returns {Object} Promise.
 *
 */
exports.index = async function (req, res) {
    const authorized = policy.filterIndex();

    if (!authorized) {
        return false;
    }

    const events = await db.Event.findAll();

    const toReturn = await Promise.all(events.map(async (ev) => {

        const registeredP = ev.getRegistered();
        const newEvent = await ev.toJSON();
        const registered = await registeredP;

        newEvent.registeredCount = registered.length;

        return newEvent;
    }));


    return res.status(200).json(toReturn);
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
        return res.boom.badRequest();
    }
    const eventId = parseInt(req.params.eventId, 10);

    let event = await db.Event.findById(eventId, {include: ['registered']});

    event = event.toJSON();

    if (!event) {
        return res.boom.notFound();
    }


    const filtered = await policy.filterShow(event, req.session.id);

    if (!filtered) {
        return res.boom.unauthorized();
    }

    const promises = [];

    for (let i = 0; i < event.registered.length; i++) {
        promises.push(userPolicy.filterShow(event.registered[i], req.session.auth).then((reg) => {
            event.registered[i] = reg;

            return true;
        }));
    }

    await Promise.all(promises);


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
        return res.boom.badRequest();
    }

    /*
     * To lower case to avoid security problems
     * (users trying to create 'auTHOrs' group to gain rights)
     */
    req.body.name = req.body.name.toLowerCase();


    const authorized = policy.filterStore(req.session.auth);

    if (!authorized) {
        return res.boom.unauthorized();
    }
    try {
        const event = await db.Event.create(req.body);

        return res.status(201).json(event);

    } catch (err) {
        if (err instanceof db.Sequelize.ValidationError) {
            return res.boom.badRequest();
        }

        // Send to standard error handler
        return err;
    }


};

/**
 *
 * Updates an existing event.
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 * @param {Object} handle - The error handling function.
 *
 * @returns {Object} Promise.
 *
 */
exports.update = async function (req, res) {
    if (isNaN(parseInt(req.params.eventId, 10))) {
        return res.boom.badRequest();
    }
    const eventId = parseInt(req.params.eventId, 10);

    /*
     * To lower case to avoid security problems
     * (users trying to create 'auTHOrs' group to gain rights)
     */
    req.body.name = req.body.name.toLowerCase();

    const authorized = await policy.filterUpdate(req.session.auth);

    if (!authorized) {
        return res.boom.unauthorized();
    }

    try {
        await db.Event.update(req.body, {where: {id: eventId}});

        return res.status(204).json({});

    } catch (err) {
        if (err instanceof db.Sequelize.ValidationError) {
            return res.boom.badRequest(err);
        }

        return err;
    }


};

/**
 *
 * Deletes an event.
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 * @param {Object} handle - The error handling function.
 *
 * @returns {Object} Promise.
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
        return res.boom.badRequest();
    }
    const eventId = parseInt(req.params.eventId, 10);

    let userId = req.session.auth;

    if (!isNaN(parseInt(req.params.userId, 10))) {
        userId = parseInt(req.params.userId, 10);
    }


    const allowed = await policy.filterStoreRegistered(eventId, userId, req.session.auth);

    if (!allowed) {
        return res.boom.unauthorized();
    }

    const event = await db.Event.findById(eventId);

    if (!event) {
        return res.boom.notFound('Event not found');
    }

    const user = await db.User.findById(userId);

    if (!user) {
        return res.boom.notFound('User not found');
    }

    await event.addRegistered(userId);

    return res.status(201).json({});
};

exports.deleteRegistered = async function (req, res) {
    if (isNaN(parseInt(req.params.eventId, 10))) {
        return res.boom.badRequest();
    }
    const eventId = parseInt(req.params.eventId, 10);

    let userId = req.session.auth;

    if (typeof req.params.userId !== 'undefined' && isNaN(parseInt(req.params.userId, 10))) {
        return res.boom.badRequest();
    } else if (typeof req.params.userId !== 'undefined') {
        userId = parseInt(req.params.userId, 10);
    }


    const allowed = await policy.filterDeleteRegistered(eventId, userId, req.session.auth);

    if (!allowed) {
        return res.boom.unauthorized();
    }

    const event = await db.Event.findById(eventId);

    await event.removeRegistered(userId);

    return res.status(201).json({});

};
