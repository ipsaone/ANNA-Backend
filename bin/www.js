'use strict';

const app = require('../app');
const config = require('../config/config');
const fs = require('fs');
const https = require('https');

/*
 * HTTPS
 */
let host, port, privateKey, certificate;

// Set the app environment
config.app.env = process.argv[2] === 'prod' ? 'production' : 'development';

// Choose the right certificate depending on the environment
if (config.app.env === 'production') {
    host = config.env.prod.host;
    port = config.env.prod.port;

    privateKey = fs.readFileSync('sslcert/private.key', 'utf8');
    certificate = fs.readFileSync('sslcert/certificate.crt', 'utf8');

    console.log('Using one.ipsa.fr certificate');
} else { // Development
    host = config.env.dev.host;
    port = config.env.dev.port;

    privateKey = fs.readFileSync('sslcert/localhost.key', 'utf8');
    certificate = fs.readFileSync('sslcert/localhost.crt', 'utf8');

    console.log('Using localhost certificate');
}

let credentials = {key: privateKey, cert: certificate};

/*
 * Server
 */
https.createServer(credentials, app).listen(port, host, function () {
    console.log(`${config.app.name} v${config.app.version} listening on ${host}:${port}`);
});
