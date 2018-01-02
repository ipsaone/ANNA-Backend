'use strict';

const express = require('express'); // Web server
const bodyParser = require('body-parser'); // X-form-data decoder
const helmet = require('helmet');
const http = require('http');
const config = require('./config/config');
const boom = require('express-boom'); // Exception handling
const morgan = require('morgan');
const fs = require('fs'); // File system
const path = require('path');

require('dotenv').config();

const app = express();

/*
 * Middleware
 */

app.use(boom()); // Error responses
app.use(helmet()); // Helmet offers different protection middleware
app.use(require('./middlewares/rate_limit')); // Rate limit
app.use(bodyParser.urlencoded({extended: true})); // POST parser
app.use(bodyParser.json());
app.use(require('./middlewares/cors')); // CORS headers
app.use(require('./middlewares/session')); // Session management
app.use(require('./middlewares/auth')); // Auth check
app.use(require('express-request-id')({setHeader: false})); // Unique ID for every request

/*
 * Options
 */
app.set('trust proxy', 1); // Trust reverse proxy
app.options('*', require('./middlewares/cors')); // Pre-flight
morgan.token('id', (req) => req.id.split('-')[0]);
// Logging
if (!global.noLog) {
    app.use(morgan('[:date[iso] #:id] Started :method :url for :remote-addr', {immediate: true}));
    if (process.env.LOG_TO_CONSOLE) {
        app.use(morgan('[:date[iso] #:id] Completed in :response-time ms (HTTP :status with length :res[content-length])'));
    }
}
app.use(morgan('combined', {stream: fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})}));

/*
 * Routing and error catching
 */
app.use(require('./routes'));
app.use(require('express-async-handler'));
app.use(require('./middlewares/exception')); // Error handling

const {host, port} = config.app.getConnection();

/*
 * Server config
 */

http.createServer(app).listen(port, host, function () {
    console.log(`${config.app.name} v${config.app.version} listening on ${host}:${port}`);
});

process.on('unhandledRejection', (err) => {
    console.error('unhandled exception : ');
    console.log(err);
    console.trace();

    // eslint-disable-next-line no-process-exit
    process.exit(1);
});

module.exports = app;
