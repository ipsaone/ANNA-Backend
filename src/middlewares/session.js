'use strict';

/**
 * @file
 * @see {@link module:session}
 */

/**
 * @module session
 */

const config = require('../config/config'); // Config
const session = require('express-session'); // Session management
const Redis = require('connect-redis')(session); // Session store

/**
 *
 * Handles the user sessions settings
 * @namespace  sessions
 *
 * @property {namespace} store This is widely-used, efficient session store
 * Session store options
 * @property {object} store.socket
 * @property {BOOLEAN} logErrors
 *
 * @property {Object} secret This is to secure cookies and make sure they're not tampered with
 * @property {BOOLEAN} resave Don't save a session again if it hasn't been modified
 * @property {BOOLEAN} saveUninitialized Only save sessions in which data is stored
 *
 * @property {namespace} cookie Secure cookies
 * @property {BOOLEAN} cookie.secure
 * @property {BOOLEAN} cookie.httpOnly
 *
 * @todo set secure=true and httpOnly=true in production
 *
 */
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

    /**
     * Secure cookies !
     * @todo only in production, or allow HTTPS on dev environment !
     */
    cookie: {
        secure: false,
        httpOnly: false
    }
});
