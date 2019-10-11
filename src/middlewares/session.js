'use strict';

const config = require('../config/config'); // Config
const session = require('express-session'); // Session management
const redis = require('redis');
const Redis = require('connect-redis')(session); // Session store

let session_conf = config.session;
let client;
if(process.env.travis) {
    client = redis.createClient({
        host: session_conf.test_host,
        port: session_conf.test_port
    })
} else {
    client = redis.createClient({
        path: session_conf.socket
    })
}



module.exports = session({
    client,
    ttl: session_conf.timeout, // SEE https://github.com/tj/connect-redis/issues/251
    secret: session_conf.secret,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    maxAge: session_conf.timeout, 

    cookie: {
        secure: false,
        httpOnly: false
    }
});
