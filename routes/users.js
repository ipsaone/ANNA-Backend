'use strict';

const router = require('express').Router();
const userController = require('../controllers/user_controller');

router.route('/').
    get(userController.index).
    post(userController.store);

router.route('/:userId([0-9]+)').
    get(userController.show).
    put(userController.update).
    delete(userController.delete);

router.get('/:userId([0-9]+)/posts', userController.posts);

router.route('/:userId([0-9]+)/groups').
    get(userController.get_groups).
    put(userController.add_groups).
    delete(userController.delete_groups);

module.exports = router;
