'use strict';

const policy = require('../event_policy');


module.exports = (db) => async function (req, res) {
    if (isNaN(parseInt(req.params.eventId, 10))) {
        return res.boom.badRequest('Event ID must be an integer');

    }
    const eventId = parseInt(req.params.eventId, 10);

    const authorized = await policy.filterDelete(db, req.session.auth);

    if (!authorized) {
        return res.boom.unauthorized();
    }

    const event = await db.Event.findByPk(eventId);

    if (!event) {
        return res.boom.notFound();
    }

    await event.destroy();

    return res.status(204).json({});

};
