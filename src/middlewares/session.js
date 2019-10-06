'use strict';

const config = require('../config/config'); // Config
const session = require('express-session'); // Session management
const redis = require('redis');
const Redis = require('connect-redis')(session); // Session store

let client = redis.createClient({
    path: config.session.socket
})

module.exports = session({
    client,
    ttl: config.session.timeout, // SEE https://github.com/tj/connect-redis/issues/251
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
