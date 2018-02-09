'use strict';

const express = require('express'); // Web server
const bodyParser = require('body-parser'); // X-form-data decoder
const helmet = require('helmet');
const http = require('http');
const boom = require('express-boom'); // Exception handling
const morgan = require('morgan');
const fs = require('fs'); // File system
const path = require('path');
const config = require('./config/config');
const winston = require('winston');
const dir = './logs';


require('winston-email');

require('winston/package.json');

require('express-async-errors');

require('dotenv').config();


const loadApp = (options = {}) => {

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    winston.configure({
        transports: [
            new winston.transports.Console({
                level: 'warn',
                colorize: true
            }),
            new winston.transports.File({
                level: 'debug',
                name: 'file#debug',
                filename: './logs/debug.log',
                colorize: true
            }),
            new winston.transports.File({
                level: 'info',
                name: 'file#info',
                filename: './logs/info.log',
                colorize: true
            }),
            new winston.transports.Email({
                level: 'error',
                from: config.email.sender,
                to: config.email.errorManagers,
                service: 'Gmail',
                auth: {
                    user: config.email.sender,
                    pass: config.email.password
                }
            })
        ]
    });

    /*
     * Server config
     */

    const app = express();
    const {host, port} = config.app.getConnection();

    if (options && !options.noLog) {
        http.createServer(app).listen(port, host, function () {
            console.log(`${config.app.name} v${config.app.version} listening on ${host}:${port}`);
        });
    }


    /*
     * Middleware
     */

    app.use(boom()); // Error responses
    app.use(helmet()); // Helmet offers different protection middleware
    app.use(require('./middlewares/rate_limit')); // Rate limit
    app.use(bodyParser.urlencoded({extended: true})); // POST parser
    app.use(bodyParser.json());
    app.use(require('express-request-id')({setHeader: true})); // Unique ID for every request
    app.use(require('./middlewares/cors')); // CORS headers
    app.use(require('./middlewares/session')); // Session management
    app.use(require('./middlewares/auth')); // Auth check

    /*
     * Options
     */
    app.set('trust proxy', 1); // Trust reverse proxy
    app.options('*', require('./middlewares/cors')); // Pre-flight
    morgan.token('id', (req) => req.id.split('-')[0]);
    // Logging
    if (options && !options.noLog) {
        app.use(morgan('[:date[iso] #:id] Started :method :url for :remote-addr', {immediate: true}));
        if (process.env.LOG_TO_CONSOLE) {
            app.use(morgan('[:date[iso] #:id] Completed in :response-time ms (HTTP :status with length :res[content-length])'));
        }
    }
    app.use(morgan('combined', {stream: fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})}));

    /*
     * Routing and error catching
     */
    const ModulesFactory = require('./modules');
    const factoryOptions = {test: options.test};
    const factory = new ModulesFactory(factoryOptions);

    app.use(factory.router);

    app.use(require('./middlewares/exception')); // Error handling

    return {
        app,
        modules: factory
    };
};

if (require.main === module) {
    loadApp();
} else {
    module.exports = loadApp;
}
