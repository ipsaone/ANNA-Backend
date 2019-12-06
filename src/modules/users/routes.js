/* eslint new-cap: 0*/

'use strict';

const findRoot = require('find-root');
const path = require('path');
const root = findRoot(__dirname);
const acl = require(path.join(root, 'src', 'middlewares', 'access-control.js'));

module.exports = (db) => {
    const router = require('express').Router();
    const userController = require('./controllers')(db);

    router.route('/')
        .get(acl("index-users"), userController.index)
        .post(acl("store-user"), userController.store);

    router.route('/:userId([0-9]+)')
        .get(acl("show-user"), userController.show)
        .put(acl("update-user"), userController.update)
        .delete(acl("delete-user"), userController.delete);

    router.get('/:userId([0-9]+)/posts', acl("index-user-posts"), userController.posts);

    router.route('/:userId([0-9]+)/groups')
        .get(acl("index-user-groups"), userController.getGroups);

    router.route('/:userId([0-9]+)/groups/:groupId([0-9]+)')
        .post(acl("store-user-group"), userController.addGroup)
        .delete(acl("delete-user-group", true), userController.deleteGroup);

    return router;
};
