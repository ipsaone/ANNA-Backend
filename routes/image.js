/* eslint new-cap: 0*/

'use strict';

const router = require('express').Router();
const imageController = require('../controllers/image_controller');

router.route('/')
    .get(imageController.index)
    .post(imageController.store);

router.route('/:groupId([0-9]+)')
    .get(imageController.show)
    .put(imageController.update)
    .delete(imageController.delete);

module.exports = router;
