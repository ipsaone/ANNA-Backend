#!/usr/bin/env node


/*
Response codes :
	0-9 : success
	10-19 : authentication error
		10 : bad username
		11 : bad password
		12 : not allowed
	20-29 : request error
	30-39 : internal error


*/

// Dependencies
var express = require('express');
var fs      = require('fs');
var https   = require('https');
var http   = require('http');
var mysql   = require('mysql');
var bodyParser = require('body-parser');
var mysql      = require('mysql');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs')


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
app.use(bodyParser.urlencoded({extended: true}));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});



// Routing
	/* test */
app.get('/', function (req, res) {
  	res.send('This server actually works');
});

	/* login */
	// TODO : update response to accomodate specifications
app.post('/login', function(req, res) {
	/*
	LOGIN REQUEST POST PARAMETERS :
		- username [str] : the name of the user who wants to login
		- password [str] : the password of the user

	LOGIN RESPONSE FIELDS :
		- code [int] : the response code (see header)
		- token [str] : the unique login token to use for each request
		- validity [nbr] : the timestamp at which the token is considered outdated
	*/

	// data gathering
	var post_data = req.body;
	var username = post_data.username;
	var password = post_data.password;
	var userID = -1;
	var accept = false
	var validity = 0;
	var sesstoken = ""

	// mysql user/pwd checking
	var sql = 'SELECT ID,password FROM users WHERE LOWER(username) = LOWER(?)'
	var inserts = [username]
	sql = mysql.format(sql, inserts);
	connection.query(sql, function(err1,res1,fields1){
		if (err1) {console.error('SQL query error : ' + err.stack); return;}

		// User not found
		if(res1.length == 0) { 
			accept = false; 
			var response = {accept: accept, token: sesstoken, validity: validity} 
			res.send(JSON.stringify(response));
		}
		
		// User found
		else if(res1.length == 1){
			var hash = res1[0].password
			bcrypt.compare(password, hash, function(err2, res2) {
			
				if (err2) {console.error('error comparing BCrypt : ' + err.stack); return;}

				// Hashes match
				if (res2) {
					accept = true
					userID = res1[0].ID;

					if( accept ) {
						validity = 60*4; // in minutes
						sesstoken = crypto.randomBytes(64).toString('hex'); // see https://stackoverflow.com/questions/8855687

						// save session token in DB
						// TODO

					}

					// response sending
					var response = {accept: accept, token: sesstoken, validity: validity} 
					res.send(JSON.stringify(response));

				}
				
				// Hashes doesn't match
				else { accept = false }
			})
		}
		
		// Multiple users found
		else {
			console.error("SQL Query error : too many results !!")
			accept = false
			var response = {accept: accept, token: sesstoken, validity: validity} 
			res.send(JSON.stringify(response));
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
		- posts [arr(obj)] : the blog posts


	*/
	var post_data = req.body;
	if(!checkToken(req)) {
		res.send(JSON.stringify({success: false, errcode: 10}))
		return;
	}



	res.send(true);
});

app.post('/log', function(req, res) {
	/*
	LOG REQUEST POST PARAMETERS :

	LOG RESPONSE FIELDS :

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
			"LIST", to list all files and directories in a folder
			"DWNL", to download the contents of a file
			"UPL", to upload a new file
			"EDIT", to change the contents of a file or its metadata
			"META", to get the file metadata
		- target [nbr] : the file or directory ID, 0 for root (/)

	DRIVE RESPONSE FIELDS :
		- code [int] : the response code (see header)
		-

	*/
	var post_data = req.body;
	if(!checkToken(req)) {
		res.send(JSON.stringify({success: false, errcode: 10}))
		return;
	}



	res.send(true);	
});

function checkToken(req) {
	return true;
}



server.listen(port, function () {
  console.log('Backend server listening on port '+port);
});
