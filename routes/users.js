'use strict';

const router = require('express').Router();
const user_controller = require('../controllers/user_controller');

router.route('/').
    get(user_controller.index).
    post(user_controller.store);

router.route('/:userId([0-9]+)').
    get(user_controller.show).
    put(user_controller.update).
    delete(user_controller.delete);

router.get('/:userId([0-9]+)/posts', user_controller.posts);

router.route('/:userId([0-9]+)/groups').
    get(user_controller.get_groups).
    put(user_controller.add_groups).
    delete(user_controller.delete_groups);

module.exports = router;
