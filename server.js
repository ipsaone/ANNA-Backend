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

// External dependencies
var express = require('express');          // Web server
var fs      = require('fs');               // File system
var https   = require('https');            // Secure HTTP protocol
var mysql   = require('mysql');            // Database interface
var bodyParser = require('body-parser');   // X-form-data decoder
var crypto = require('crypto');            // Cryptography 
var helmet = require('helmet');            // Web server safety
var session = require('express-session');  // Session management
var cors = require('cors')                 // Cross Origin Resource Sharing

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
var whitelist = ['http://localhost', 'https://one.ipsa.fr']
function getOrigin(origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {callback(null, true)}
    else {callback(new Error('Not allowed by CORS'))}
  }
app.use(cors({origin : getOrigin}))
	// Session management
app.use(session({
		// This is to secure cookies and make sure they're not tampered with
	secret: "HYlFhWoHBGPxVnHqP45K", 
		// Don't save a session again if it hasn't been modified
	resave : false,
		// Only save sessions in which data is stored
	saveUninitialized : false,

	cookie: {secure: false, HttpOnly: false}
}));
	// Session check
app.use(function(req, res, next) {

	res.header('Access-Control-Allow-Credentials', 'true');
	if(req.url != "/" && req.url != "/login") {
		
		if(!req.session.userID) {
			res.json({code: 13})
			return;
		}
		
	} 

	next();
});


// Routing
	/* test */
app.get('/', function (req, res) {
  	res.send("This server works !")
  	return;
});


app.post('/', function(req, res) {
	var sess = req.session
	if (sess.views) {
		sess.views++
		sess.save()
		res.header('Access-Control-Allow-Credentials', 'true');
		res.json({test: true, views: sess.views})
	} else {
		sess.views = 1
		sess.save()
		res.end('welcome to the session demo. refresh!')
	}
})

	/* Internal dependencies */
var handleLogin = require('./server_login')(pool)
var handleDrive = require('./server_drive')(pool)
var handleBlog = require('./server_blog')(pool)
var handleLog = require('./server_log')(pool)

	/* backend */
app.post('/login', handleLogin);
app.post('/blog', handleBlog);
app.post('/log', handleLog);
app.post('/drive', handleDrive);

// Listening
server.listen(port, function () {
  console.log('Backend server listening on port '+port);
});
