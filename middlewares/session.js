'use strict';

const config  = require('../config/config');       // Config
const session = require('express-session');  	   // Session management
const redis   = require('connect-redis')(session); // Session store

module.exports = session({
    // This is a very widely-used, efficient session store
    store: new redis({
        // Session store options
        socket: config.session.socket ,
        logErrors: true
    }),

    // This is to secure cookies and make sure they're not tampered with
    secret: config.session.secret,
    // Don't save a session again if it hasn't been modified
    resave: false,
    // Only save sessions in which data is stored
    saveUninitialized: false,
    // Secure cookies !
    cookie: {secure: true, httpOnly: false}
});