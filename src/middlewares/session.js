'use strict';

const config = require('../config/config'); // Config
const session = require('express-session'); // Session management
const Redis = require('connect-redis')(session); // Session store

module.exports = session({

    store: new Redis({
        // Session store options
        socket: config.session.socket,
        logErrors: true,
        ttl: config.session.timeout // SEE https://github.com/tj/connect-redis/issues/251
    }),

    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    maxAge: config.session.timeout, 

    cookie: {
        secure: false,
        httpOnly: false
    }
});
