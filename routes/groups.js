'use strict';

const router = require('express').Router();
const groupController = require('../controllers/group_controller');

router.route('/').
    get(groupController.index).
    post(groupController.store);

router.route('/:groupId([0-9]+)').
    get(groupController.show).
    put(groupController.update).
    delete(groupController.delete);

module.exports = router;
