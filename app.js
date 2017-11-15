'use strict';

const express = require('express'); // Web server
const bodyParser = require('body-parser'); // X-form-data decoder
const helmet = require('helmet');
const https = require('https');
const config = require('./config/config');
const boom = require('express-boom'); // Exception handling

const app = express();

/*
 * Middleware
 */

app.use(boom()) // Error handling
app.use(require('./middlewares/exception')) // Error handling

app.use(helmet()); // Helmet offers different protection middleware
app.use(require('./middlewares/rate_limit')); // Rate limit
app.use(bodyParser.urlencoded({extended: true})); // POST parser
app.use(bodyParser.json());
app.use(require('./middlewares/cors')); // CORS headers
app.use(require('./middlewares/session')); // Session management
app.use(require('./middlewares/auth')); // Auth check


/*
 * Options
 */
app.set('trust proxy', 1); // Trust first proxy
app.options('*', require('./middlewares/cors')); // Pre-flight

/*
 * Routing
 */
app.use(require('./routes'));

/*
 * Server config
 */

// Choose the right certificate depending on the environment
const certificates = config.app.getCertificates();
const {host, port} = config.app.getConnection();

https.createServer(certificates, app).listen(port, host, function () {
    console.log(`${config.app.name} v${config.app.version} listening on ${host}:${port}`);
});

module.exports = app;
