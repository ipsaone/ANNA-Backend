/* eslint new-cap: 0*/

'use strict';


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
        .get(missionController.show)
        .put(missionController.update)
        .delete(missionController.delete);


    router.route('/')
        .get(missionController.index)
        .post(missionController.store);


    return router;
};