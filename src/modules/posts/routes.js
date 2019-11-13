/* eslint new-cap: 0*/
'use strict';

const findRoot = require('find-root');
const path = require('path');
const root = findRoot(__dirname);
const acl = require(path.join(root, 'src', 'middlewares', 'access-control.js'));

module.exports = (db) => {
    const router = require('express').Router();
    const postController = require('./controllers')(db);



    router.route('/')
        .get(acl("index-posts", true), postController.index)
        .post(acl("store-post"), postController.store);

    router.route('/:postId([0-9]+)')
        .get(acl("show-post", true), postController.show)
        .put(acl("update-post"), postController.update)
        .delete(acl("delete-post"), postController.delete);

    return router;
};
