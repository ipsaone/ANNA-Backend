'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const http = require('http');
const boom = require('express-boom');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const config = require('./config/config');
const pkg = require('../package.json');
require('express-async-errors');
require('dotenv').config();


const loadApp = (options = {}) => {

    /* STARTUP CHECKS */
    let start = process.hrtime();
    if(!options) { exit(-1); }
    morgan.token('id', (req) => req.id.split('-')[0]);
    const app = express();
    const {host, port} = config.getConnection();
    
    /* MIDDLEWARE */
    app.use(boom()); // Error responses
    app.use(helmet()); // Helmet offers different protection middleware
    app.use(require('./middlewares/rate_limit')); // Rate limit
    app.use(bodyParser.urlencoded({extended: true})); // POST parser
    app.use(bodyParser.json());
    app.use(require('express-request-id')({setHeader: true})); // Unique ID for every request
    app.use(require('./middlewares/transaction')(options)); // Build transaction object
    app.use(require('./middlewares/timing'));
    if (!options.noLog) {
        app.use(morgan('[:date[iso] #:id] Started :method :url for :remote-addr', {immediate: true}));
        app.use(morgan('[:date[iso] #:id] Completed in :response-time ms (HTTP :status with length :res[content-length])'));
    }
    app.use(morgan('combined', {stream: fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})}));
    app.use(require('./middlewares/session')); // Session management
    app.use(require('./middlewares/auth')); // Auth check
    app.set('trust proxy', 1); // Trust reverse proxy
    app.use(require('./middlewares/cors')); // CORS headers
    app.options('*', require('./middlewares/cors'));    // Pre-flight
                                                        // TODO : FIX THIS SECURITY ISSUE (CSRF !)

    /* STATIC FOLDERS */
    app.use('/doc', express.static(path.join(__dirname, '../doc')));
    app.use('/coverage', express.static(path.join(__dirname, '../coverage')));

    /* BACKEND API */
    const ModulesFactory = require('./modules');
    const factoryOptions = {test: options.test};
    const factory = new ModulesFactory(factoryOptions);
    app.use(factory.router);


    /* ERROR HANDLING, MUST ALWAYS BE LAST MIDDLEWARE */
    app.use(require('./middlewares/exception')); // Error handling
    

    /* SERVER LISTENER */
    if(options.test || options.noServ) { return {app, modules: factory}; }
    let server = http.createServer(app).listen(port, host, function () {
        if (options.noLog) { return; }
        console.log(`A.N.N.A v${pkg.version} listening on ${host}:${port}`);
        const elapsedHrTime = process.hrtime(start);
        console.log("Started in", elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6, "ms");
    });

    /* SERVER INTERRUPT SIGNAL CATCHER */
    process.on('SIGINT', function() {
        console.log("\nCaught interrupt signal, exiting...");
        server.close(() => { console.log("All done !"); process.exit(0); })
    });

    
};

if (require.main === module) {
    loadApp();
} else {
    module.exports = loadApp;
}
