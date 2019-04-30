'use strict';

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');

const policy = require('../event_policy');
const userPolicy = require(path.join(root, './src/modules/users/user_policy'));


module.exports = (db) => async function (req, res) {
    if (isNaN(parseInt(req.params.eventId, 10))) {
        req.transaction.logger.info('Event ID must be an integer');
        return res.boom.badRequest('Event ID must be an integer');
    }
    const eventId = parseInt(req.params.eventId, 10);

    req.transaction.logger.info('Finding event');
    let event = await db.Event.findByPk(eventId, {include: ['registered']});

    event = event.toJSON();

    if (!event) {
        req.transaction.logger.info('Event not found');
        return res.boom.notFound();
    }


    req.transaction.logger.info('Invoking policies');
    const allowed = await policy.filterShow(req.transaction, event, req.session.id);

    if (!allowed) {
        req.transaction.logger.info('Policies denied access');
        return res.boom.unauthorized();
    }

    req.transaction.logger.info('Invoking policies for users in the event');
    const promises = [];
    for (let i = 0; i < event.registered.length; i++) {
        promises.push(userPolicy.filterShow(db, event.registered[i], req.session.auth).then((reg) => {
            event.registered[i] = reg;
            return true;
        }));
    }
    await Promise.all(promises);

    req.transaction.logger.debug('Returning event');
    return res.status(200).json(event);
};
