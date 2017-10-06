'use strict';

const router = require('express').Router();
const storage_controller = require('../controllers/storage_controller');

router.route('/:url')
    .get(storage_controller.index)
    .post(storage_controller.store);

module.exports = router;