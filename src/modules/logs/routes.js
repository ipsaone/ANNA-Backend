/* eslint new-cap: 0*/

'use strict';


module.exports = (db) => {
    const router = require('express').Router();
    const logController = require('./controllers')(db);

    router.route('/')
        .get(logController.index)
        .post(logController.store);

    router.route('/:logId([0-9]+)')
        .get(logController.show)
        .put(logController.update)
        .delete(logController.delete);

    return router;
};
