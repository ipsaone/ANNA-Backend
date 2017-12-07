/* eslint new-cap: 0 */

'use strict';

const router = require('express').Router();
const eventController = require('../controllers/auth_controller');

router.route('/').
    get(eventController.index).
    post(eventController.store);

router.route('/:groupId([0-9]+)').
    get(eventController.show).
    put(eventController.update).
    delete(eventController.delete);

module.exports = router;
