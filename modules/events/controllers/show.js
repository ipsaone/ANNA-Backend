'use strict';

const db = require.main.require('./modules');
const policy = require('../event_policy');
const userPolicy = require.main.require('./modules/users/user_policy');

/*
 *
 * Gets a single event
 *
 * @param {Object} req - the user request
 * @param {Object} res - the response to be sent
 *
 * @returns {Object} promise
 *
 */
module.exports = async function (req, res) {
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
