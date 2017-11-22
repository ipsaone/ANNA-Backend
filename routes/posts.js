'use strict';

const router = require('express').Router();
const post_controller = require('../controllers/post_controller');
const post_policy = require('../policies/post_policy');

router.route('/').
    get(post_controller.index).
    post(post_controller.store);

router.route('/:postId([0-9]+)').
    get(post_controller.show).
    put(post_controller.update).
    delete(post_controller.delete);

module.exports = router;
