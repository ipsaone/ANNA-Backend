/* eslint new-cap: 0*/

'use strict';

const findRoot = require('find-root');
const path = require('path');
const root = findRoot(__dirname);
const acl = require(path.join(root, 'src', 'middlewares', 'access-control.js'));

const multer = require('multer');
const config = require(path.join(root, 'src', './config/config'));
const upload = multer({dest: config.storage.temp});

module.exports = (db) => {
    const router = require('express').Router();
    const userController = require('./controllers')(db);

    router.route('/')
        .get(acl("index-users"), userController.index)
        .post(acl("store-user"), userController.store);

    router.route('/:userId([0-9]+)')
        .get(acl("show-user"), userController.show)
        .put(acl("update-user"), upload.single('profilePicture'), userController.update)
        .delete(acl("delete-user"), userController.delete);

    router.get('/:userId([0-9]+)/posts', acl("index-user-posts"), userController.posts);

    router.route('/:userId([0-9]+)/groups')
        .get(acl("index-user-groups"), userController.getGroups);

    router.route('/:userId([0-9]+)/group/:groupId([0-9]+)')
        .put(acl("store-user-group"), userController.addGroup)
        .delete(acl("delete-user-group", true), userController.deleteGroup);

    return router;
};
