/* eslint new-cap: 0 */

'use strict';


const findRoot = require('find-root');
const path = require('path');
const root = findRoot(__dirname);
const acl = require(path.join(root, 'src', 'middlewares', 'access-control.js'));



module.exports = (db) => {
    const router = require('express').Router();
    const eventController = require('./controllers')(db);

    router.route('/')
        .get(acl("index-events"), eventController.list)
        .post(acl("store-event"), eventController.store);

    router.route('/:eventId([0-9]+)')
        .get(acl("show-event"), eventController.show)
        .put(acl("update-event"), eventController.update)
        .delete(acl("delete-event"), eventController.delete);

    router.route('/:eventId([0-9]+)/register/:userId([0-9]+)')
        .put(acl("store-event-attendant", true), eventController.addAttendant)
        .delete(acl("delete-event-attendant", true), eventController.removeAttendant);

    router.route('/:eventId([0-9]+)/register')
        .put(acl("store-event-attendant", true), eventController.addAttendant)
        .delete(acl("delete-event-attendant", true), eventController.removeAttendant);

    return router;
};
