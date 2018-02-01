'use strict';

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');
const db = require(path.join(root, './modules'));
const policy = require('../event_policy');
const joi = require('joi');

const schema = joi.object().keys({
    name: joi.string(),
    markdown: joi.string(),
    maxRegistered: joi.number().integer(),
    startDate: joi.string(),
    endDate: joi.string()
});

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
module.exports = async function (req, res) {
    if (typeof req.body.name !== 'string') {
        return res.boom.badRequest();
    }

    // Validate user input
    const validation = joi.validate(req.body, schema);

    if (validation.error) {
        return res.boom.badRequest(validation.error);
    }

    /*
     * To lower case to avoid security problems
     * (users trying to create 'auTHOrs' group to gain rights)
     */
    if (req.body.name) {
        req.body.name = req.body.name.toLowerCase();
    }


    const authorized = policy.filterStore(req.session.auth);

    if (!authorized) {
        return res.boom.unauthorized();
    }
    const event = await db.Event.create(req.body);

    return res.status(201).json(event);


};
