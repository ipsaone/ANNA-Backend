/* eslint new-cap: 0*/

'use strict';

const router = require('express').Router();
const postController = require('./controllers');

router.route('/')
    .get(postController.index)
    .post(postController.store);

router.route('/:postId([0-9]+)')
    .get(postController.show)
    .put(postController.update)
    .delete(postController.delete);

module.exports = router;
