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
	30-39 : internal error
		31 : database error
		32 : processing error


*/

// Dependencies
var express = require('express');        // Web server
var fs      = require('fs');             // File system
var https   = require('https');          // Secure HTTP protocol
var mysql   = require('mysql');          // Database interface
var bodyParser = require('body-parser'); // X-form-data decoder
var crypto = require('crypto');          // Cryptography 
var bcrypt = require('bcrypt-nodejs')    // BCrypt algorithm for password management
var helmet = require('helmet')           // Web server safety
var session = require('express-session') // Session management


// Configuration
var https_enabled = true;
var localhost = (process.argv[2] != "prod");
var port  = 8080;

// HTTPS
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
var app = express()
var server = https.createServer(credentials, app);
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'OneServ_2017',
  database : 'ipsaone'
});

connection.connect(function(err) {
  if (err) {console.error('error connecting to MySQL: ' + err.stack); return;}
 
  console.log('connected to mysql ');
});

// Middleware
	// POST parser
app.use(bodyParser.urlencoded({extended: true}));
	// CORS headers
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
	// Session
app.use(session({
	secret: "HYlFhWoHBGPxVnHqP45K",
	resave : false,
	saveUninitialized : false
}));


// Routing
	/* test */
app.get('/', function (req, res) {
  	res.send('This server actually works');
});

	/* login */
app.post('/login', function(req, res) {
	/*
	LOGIN REQUEST POST PARAMETERS :
		- username [str] : the name of the user who wants to login
		- password [str] : the password of the user

	LOGIN RESPONSE FIELDS :
		- code [int] : the response code (see header)
		- accept [bool] : whether the login request is accepted
	*/

	// data gathering
	var post_data = req.body;
	var username = post_data.username;
	var password = post_data.password;


	// mysql user/pwd checking
	var sql = 'SELECT ID,password FROM users WHERE LOWER(username) = LOWER(?)'
	var inserts = [username]
	sql = mysql.format(sql, inserts);
	connection.query(sql, function(err1,res1,fields1){
		if (err1) {
			console.error('SQL query error : ' + err.stack);
			res.json({accept: false, code: 31});
			return;
		}

		// User not found
		if(res1.length == 0) { 
			res.json({accept: false, code: 10});
		}
		
		// User found
		else if(res1.length == 1){
			var hash = res1[0].password
			bcrypt.compare(password, hash, function(err2, res2) {
			
				if (err2) {
					console.error('error comparing BCrypt : ' + err.stack);
					res.json({accept: false, code: 32});
					return;
				}

				// Hashes match
				if (res2) {
					req.session.userID = res1[0].ID;

					// response sending
					res.json({accept: true, code: 0});
					return;
				}
				
				// Hashes doesn't match
				else {
					res.json({accept: false, code: 11});
					return;
				}
			})
		}
		
		// Multiple users found
		else {
			console.error("SQL Query error : too many results !!")
			res.json({accept: false, code: 31});
			return;
		}
	})
});


app.post('/blog', function(req, res) {
	/*
	BLOG REQUEST POST PARAMETERS :
		- type [str] :
			"LIST", to list all blog posts with basic information
			"DETAILS", to get all information about a blog post
			"EDIT", to edit a blog post
		- start [int] : how many posts to skip (type="LIST" only, optional)
		- limit [int] : how many posts to list (type="LIST" only, optional)
		- post_id [int] : the post ID (type="EDIT" or type="DETAILS")

	BLOG RESPONSE FIELDS :
		- code [int] : the response code (see header)
		- posts [arr(obj)] : the blog posts (type="LIST" only)
			object fields : id [int], public [bool], title [str], banner_img_url [str], timestamp [int], publisher_name [str]
		- post [obj] : the blog post (type="DETAILS" only)
			object fields : id [int], public [bool], title [str], timestamp [int], contents [str], publisher_id [int], img_ulrs [obj]
				images object fields : list_banner [str], post_banner [str]



	*/
	var post_data = req.body;
	if (!req.session.userID) {
		res.json({code : 12})
	}



	res.send(true);
});

app.post('/log', function(req, res) {
	/*
	LOG REQUEST POST PARAMETERS :
		- type [str] :
			"TASKS", to get current tasks data
			"MSG", to get the Message of the Day
			"UPDTS", to get latest updates
			"STATS", to get today's tasks statistics

	LOG RESPONSE FIELDS :
		- code [int] : the response code (see header)
		- tasks [arr(obj)] : the currents tasks (type="TASKS" only)
			object fields :  name [str], percentage [int]
		- message [obj] : the Message of the Day (type="MSG" only)
			object fields : msg [str], publisher_name [str], timestamp [int], publisher_groups [arr(str)]
		- updates [arr(obj)] : the latest updates (type="UPDTS" only)
			object fields : action [str], timestamp [int], publisher_name [str], publisher_groups [arr(str)]
		- stats [obj] : the tasks statistics (type="STATS" only)
			object fields : tasks_per_day [int], tasks_objective [int], tasks_data [arr(obj)]
				tasks_data object fields : month [int], day [int], tasks [int]

	*/
	var post_data = req.body;
	if(!checkToken(req)) {
		res.send(JSON.stringify({success: false, errcode: 10}))
		return;
	}

	res.send(true);	
	
});


app.post('/drive', function(req, res) {
	/*
	DRIVE REQUEST POST PARAMETERS :
		- type [str] : 
			"LIST", to list all files (and directories) in a folder
			"DWNL", to download the contents of a file
			"UPL", to upload a new file
			"EDIT", to change the contents of a file or its metadata
			"META", to get the file metadata
			"MOVE", to move a file
		- target [nbr] : the file or directory ID, 0 for root (/)
		- changes [obj] : the attributes to edit (type="EDIT" only)
			object fields : to be determined
		- destination [int] : the directory ID of the destination (type="MOVE" only)

	DRIVE RESPONSE FIELDS :
		- code [int] : the response code (see header)
		- files [arr(obj)] : the list of files (type="LIST" only)
			object fields : filename [str], rights [int], filetype [str], filesize [int], publisher_name [str]
		- dirtree [arr(obj)] : the current position in the directory tree (type="LIST" only)
			object fields : dir_id [int], dir_name [str]
		- file [obj] : the file to download (type="DWNL" only)
			object fields : filename [str], rights [int], filetype [str], filesize [int], publisher_id [int], contents [str]

	*/
	var post_data = req.body;
	if(!checkToken(req)) {
		res.send(JSON.stringify({success: false, errcode: 10}))
		return;
	}



	res.send(true);	
});

	/*
	USERPAGE REQUEST POST PARAMETERS :


	USERPAGE RESPONSE FIELDS :
		- 

	*/
app.post('/userpage', function(req, res) {

});

	/*
	NOTIFICATIONS REQUEST POST PARAMETERS :

	NOTIFICATIONS RESPONSE FIELDS :
	
	*/
app.post('/notifications', function(req, res) {

});

	/*
	DISCONNECT REQUEST POST PARAMETERS :

	DISCONNECT RESPONSE FIELDS :
	
	*/
app.post('/disconnect', function(req, res) {

})





server.listen(port, function () {
  console.log('Backend server listening on port '+port);
});
