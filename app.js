'use strict';

/*
Response codes :
	-1  : unknown
	0-9 : success
		0 : authentication success
		1 : request success
	10-19 : authentication error
		10 : bad username
		11 : bad password
		12 : not authorized
		13 : not logged
	20-29 : request error
		21 : missing field
		22 : bad field type
		23 : not found
		24 : bad request
	30-39 : internal error
		31 : database error
		32 : processing error
*/

const express = require('express'); // Web server
const bodyParser = require('body-parser'); // X-form-data decoder
const helmet = require('helmet');

const app = express();

/*
 * Middleware
 */
app.use(helmet()); // Helmet offers different protection middleware
app.use(require('./middlewares/rate_limit')); // Rate limit
app.use(bodyParser.urlencoded({extended: true})); // POST parser
app.use(bodyParser.json());
app.use(require('./middlewares/cors')); // CORS headers
app.use(require('./middlewares/session')); // Session management
// app.use(require('./middlewares/auth')); // Auth check

/*
 * Options
 */
app.set('trust proxy', 1); // Trust first proxy
app.options('*', require('./middlewares/cors')); // Pre-flight

/*
 * Routing
 */
app.use(require('./routes'));

module.exports = app;