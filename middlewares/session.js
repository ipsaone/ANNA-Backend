'use strict';

const config = require('../config/config'); // Config
const session = require('express-session'); // Session management
const Redis = require('connect-redis')(session); // Session store

/**
 *
 * Handles the user sessions settings
 * @todo : set secure=true and httpOnly=true in production
 *
 */
module.exports = session({
    // This is a very widely-used, efficient session store
    store: new Redis({
        // Session store options
        socket: config.session.socket,
        logErrors: true
    }),

    // This is to secure cookies and make sure they're not tampered with
    secret: config.session.secret,
    // Don't save a session again if it hasn't been modified
    resave: false,
    // Only save sessions in which data is stored
    saveUninitialized: false,

    /*
     * Secure cookies !
     * TODO : only in production, or allow HTTPS on dev environment !
     */
    cookie: {
        secure: false,
        httpOnly: false
    }
});
