/* eslint new-cap: 0*/

'use strict';

module.exports = (db) => {
    const router = require('express').Router();
    const userController = require('./controllers')(db);

    router.route('/')
        .get(userController.index)
        .post(userController.store);

    router.route('/:userId([0-9]+)')
        .get(userController.show)
        .put(userController.update)
        .delete(userController.delete);

    router.get('/:userId([0-9]+)/posts', userController.posts);

    router.route('/:userId([0-9]+)/groups')
        .get(userController.getGroups)
        .put(userController.addGroups)
        .delete(userController.deleteGroups);

    return router;
};
