/* eslint new-cap: 0*/

'use strict';

const router = require('express').Router();
const groupController = require('../controllers/group');

router.route('/')
    .get(groupController.index)
    .post(groupController.store);

router.route('/:groupId([0-9]+)')
    .get(groupController.show)
    .put(groupController.update)
    .delete(groupController.delete);

module.exports = router;
