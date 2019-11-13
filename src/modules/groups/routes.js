/* eslint new-cap: 0*/

'use strict';


const findRoot = require('find-root');
const path = require('path');
const root = findRoot(__dirname);
const acl = require(path.join(root, 'src', 'middlewares', 'access-control.js'));


module.exports = (db) => {
    const router = require('express').Router();
    const groupController = require('./controllers')(db);

    router.route('/')
        .get(acl("index-groups"), groupController.index)
        .post(acl("store-group"), groupController.store);

    router.route('/:groupId([0-9]+)')
        .get(acl("show-group"), groupController.show)
        .put(acl("update-group"), groupController.update)
        .delete(acl("delete-group"), groupController.delete);

    return router;
};
