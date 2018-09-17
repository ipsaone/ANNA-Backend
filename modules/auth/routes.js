'use strict';

module.exports = function (db) {

    /* eslint new-cap: 0 */
    const router = require('express').Router();

    router.post('/login', require('./login')(db));
    router.get('/logout', require('./logout')(db));
    router.get('/check', require('./check')(db));

    return router;
};
