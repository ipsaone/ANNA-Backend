'use strict';

module.exports = function (db) {

    /* eslint new-cap: 0 */
    const router = require('express').Router();

    router.post('/login', require('./login')(db));
    router.get('/logout', require('./logout')(db));
    router.get('/check', require('./checkLogin')(db));
    router.get('/checkToken', require('./checkToken')(db));
    router.post('/resetPassword', require('./resetPassword')(db));
    router.post('/getToken', require('./getToken')(db));
    router.post('/changePassword', require('./changePassword')(db));

    return router;
};
