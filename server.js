
// Dependencies
var express = require('express');
var fs      = require('fs');
var https   = require('https');
var http   = require('http');
var mysql   = require('mysql');
var bodyParser = require('body-parser');
var mysql      = require('mysql');
var crypto = require('crypto')

// Configuration
var https_enabled = true;
var localhost = true;
var port  = 8080;

// HTTPS
if( !localhost ) {
	var privateKey  = fs.readFileSync('sslcert/private.key', 'utf8');
	var certificate = fs.readFileSync('sslcert/certificate.crt', 'utf8');
} else {
	var privateKey  = fs.readFileSync('sslcert/localhost.key', 'utf8');
	var certificate = fs.readFileSync('sslcert/localhost.crt', 'utf8');
}

var credentials = {key: privateKey, cert: certificate};


// Initialization
var app = express()

var server = https.createServer(credentials, app);

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'OneServ_2017'
});

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
 
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
app.post('/login', function(req, res) {

	// data gathering
	var post_data = req.body;
	var username = post_data.username;
	var password = post_data.password;

	// mysql user/pwd checking
	// TODO
	var accept = true;

	// response creation
	if( accept ) {
		var validity = 60*4;
		var sesstoken = crypto.randomBytes(64).toString('hex');
	} else {
		var validity = 0;
		var sesstoken = "";
	}
	
	// response sending
	var response = {accept: accept, token: sesstoken, validity: validity} 
	res.send(JSON.stringify(response));
});

	/* blog */
app.post('/blog', function(req, res) {
	var post_data = req.body;
	res.send(true);
});

app.post('/log', function(req, res) {
	var post_data = req.body;
	res.send(true);	
	
});



server.listen(port, function () {
  console.log('Backend server listening on port '+port);
});
