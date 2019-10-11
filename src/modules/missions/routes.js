'use strict';

const findRoot = require('find-root');
const path = require('path');
const root = findRoot(__dirname);
const acl = require(path.join(root, 'src', 'middlewares', 'access-control.js'));


module.exports = (db) => {
    const router = require('express').Router();
    const missionController = require('./controllers')(db);


    router.route('/:missionId([0-9]+)/task/:taskId([0-9]+)')
        .get(acl("show-task", true), missionController.showTask)
        .put(acl("update-task", true), missionController.updateTask)
        .delete(acl("delete-task", true), missionController.deleteTask);


    router.route('/:missionId([0-9]+)/tasks')
        .get(acl("index-tasks", true), missionController.indexTasks)
        .post(acl("store-task", true), missionController.storeTask);

    router.route('/:missionId([0-9]+)/members/:memberId([0-9]+)')
        .put(acl("add-member-mission", true), missionController.storeMember)
        .delete(acl("rem-member-mission", true), missionController.deleteMember);


    router.route('/:missionId([0-9]+)')
        .get(acl("show-mission"), missionController.show)
        .put(acl("update-mission", true), missionController.update)
        .delete(acl("delete-mission"), missionController.delete);


    router.route('/')
        .get(acl("index-missions"), missionController.index)
        .post(acl("store-mission"), missionController.store);


    return router;
};