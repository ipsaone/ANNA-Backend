#!/usr/bin/env nodejs


/*
Response codes :
	-1  : unknown
	0-9 : success
		0 : authentication success
		1 : request success
	10-19 : authentication error
		10 : bad username
		11 : bad password
		12 : not allowed
	20-29 : request error
		21 : missing field
		22 : bad field type
		23 : not found
		24 : bad request
	30-39 : internal error
		31 : database error
		32 : processing error


*/

// External dependencies
var express = require('express');          // Web server
var fs      = require('fs');               // File system
var https   = require('https');            // Secure HTTP protocol
var mysql   = require('mysql');            // Database interface
var bodyParser = require('body-parser');   // X-form-data decoder
var crypto = require('crypto');            // Cryptography 
var helmet = require('helmet');            // Web server safety
var session = require('express-session');  // Session management

// Configuration
	// Check if the executable has been started with the "prod" argument
	// Like this : "node server.js prod" or "./server.js prod"
var localhost = (process.argv[2] != "prod");
var port  = 8080;

// HTTPS
	// Choose the right certificate depending on the evironment
if( !localhost ) {
	var privateKey  = fs.readFileSync('sslcert/private.key', 'utf8');
	var certificate = fs.readFileSync('sslcert/certificate.crt', 'utf8');
	console.log("Using one.ipsa.fr certificate")
} else {
	var privateKey  = fs.readFileSync('sslcert/localhost.key', 'utf8');
	var certificate = fs.readFileSync('sslcert/localhost.crt', 'utf8');
	console.log("Using localhost certificate")
}

var credentials = {key: privateKey, cert: certificate};


// Initialization
	// Express application
var app = express()
	// HTTPS web server
var server = https.createServer(credentials, app);
	// Each connection can execute one query at a time
	// A connection pools helps manage multiple connections
	// It makes parallel connections possible
var pool = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : 'OneServ_2017',
  database : 'ipsaone',
  queueLimit : 20
});


// Middleware
	// POST parser
app.use(bodyParser.urlencoded({extended: true}));
	// CORS headers
app.use(function(req, res, next) {
		// This is used to make sure we can make AJAX calls from other domains
		// For instance, we can AJAX one.ipsa.fr:8080 from one.ipsa.fr
		// This would be disallowed otherwise (Cross Origin Resource Sharing)
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", 
  		"Origin, X-Requested-With, Content-Type, Accept");
		// This calls the next middleware
 	next();
});
	// Session management
app.use(session({
		// This is to secure cookies and make sure they're not tampered with
	secret: "HYlFhWoHBGPxVnHqP45K", 
		// Don't save a session again if it hasn't been modified
	resave : false,
		// Only save sessions in which data is stored
	saveUninitialized : false
}));


// Routing
	/* test */
app.get('/', function (req, res) {
  	res.send('This server actually works');
});

	/* Internal dependencies */
var login_js = require('./server_login')(pool)
var drive_js = require('./server_drive')(pool)
var blog_js = require('./server_blog')(pool)
var log_js = require('./server_log')(pool)

	/* backend */
app.post('/login', login_js.handleRequest);
app.post('/blog', blog_js.handleRequest);
app.post('/log', log_js.handleRequest);
app.post('/drive', drive_js.handleRequest);

// Listening
server.listen(port, function () {
  console.log('Backend server listening on port '+port);
});
