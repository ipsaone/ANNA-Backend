'use strict';

const config = require('../config/config'); // Config
const session = require('express-session'); // Session management
const Redis = require('connect-redis')(session); // Session store

module.exports = session({

    store: new Redis({
        // Session store options
        socket: config.session.socket,
        logErrors: true
    }),

    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    maxAge: 1000*60*30, // 1000ms * 60s * 30min

    cookie: {
        secure: false,
        httpOnly: false
    }
});
