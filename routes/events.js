/* eslint new-cap: 0 */

'use strict';

const router = require('express').Router();
const eventController = require('../controllers/event_controller');

router.route('/')
    .get(eventController.index)
    .post(eventController.store);

router.route('/:eventId([0-9]+)')
    .get(eventController.show)
    .put(eventController.update)
    .delete(eventController.delete);

router.route('/:eventId([0-9]+)/register/:userId([0-9]+)')
    .put(eventController.storeRegistered)
    .delete(eventController.deleteRegistered);

module.exports = router;
