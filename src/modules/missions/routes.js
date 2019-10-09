'use strict';

const findRoot = require('find-root');
const path = require('path');
const root = findRoot(__dirname);
const acl = require(path.join(root, 'src', 'middlewares', 'access-control.js'));


module.exports = (db) => {
    const router = require('express').Router();
    const missionController = require('./controllers')(db);


    router.route('/:missionId([0-9]+)/task/:taskId([0-9]+)')
        .get(missionController.showTask)
        .put(missionController.updateTask)
        .delete(missionController.deleteTask);


    router.route('/:missionId([0-9]+)/tasks')
        .get(missionController.indexTasks)
        .post(missionController.storeTask);

    router.route('/:missionId([0-9]+)/members/:memberId([0-9]+)')
        .put(missionController.storeMember)
        .delete(missionController.deleteMember);


    router.route('/:missionId([0-9]+)')
        .get(acl("show-mission"), missionController.show)
        .put(acl("update-mission"), missionController.update)
        .delete(acl("delete-mission"), missionController.delete);


    router.route('/')
        .get(acl("index-missions"), missionController.index)
        .post(acl("store-mission"), missionController.store);


    return router;
};