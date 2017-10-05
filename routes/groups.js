'use strict';

const router = require('express').Router();
const group_controller = require('../controllers/group_controller');

router.route('/')
    .get(group_controller.index)
    .post(group_controller.store);

router.route('/:groupId([0-9]+)')
    .get(group_controller.show)
    .put(group_controller.update)
    .delete(group_controller.delete);

module.exports = router;