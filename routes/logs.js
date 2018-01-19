/* eslint new-cap: 0*/

'use strict';

const router = require('express').Router();
const logController = require('../controllers/log');

router.route('/')
    .get(logController.index)
    .post(logController.store);

router.route('/:logId([0-9]+)')
    .get(logController.show)
    .put(logController.update)
    .delete(logController.delete);

module.exports = router;
