/* eslint new-cap: 0*/

'use strict';


module.exports = (db) => {
    const router = require('express').Router();
    const groupController = require('./controllers')(db);

    router.route('/')
        .get(groupController.index)
        .post(groupController.store);

    router.route('/:groupId([0-9]+)')
        .get(groupController.show)
        .put(groupController.update)
        .delete(groupController.delete);

    return router;
};
