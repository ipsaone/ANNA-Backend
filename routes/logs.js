'use strict';

const router = require('express').Router();
const log_controller = require('../controllers/log_controller');

router.route('/')
    .get(log_controller.index)
    .post(log_controller.store);

router.route('/:logId([0-9]+)')
    .get(log_controller.show)
    .put(log_controller.update)
    .delete(log_controller.delete);

module.exports = router;