// Dependencies
var express = require('express');
var fs      = require('fs');
var https   = require('https');
var http   = require('http');
var mysql   = require('mysql');
var bodyParser = require('body-parser');
var mysql      = require('mysql');

// Configuration
var https = false;
var port  = 8080;

// HTTPS
if( https ){
	var privateKey  = fs.readFileSync('sslcert/key.pem', 'utf8');
	var certificate = fs.readFileSync('sslcert/cert.pem', 'utf8');
	var credentials = {key: privateKey, cert: certificate};
}

// Initialization
var app = express()

if( https ){
	var server = https.createServer(credentials, app);
} else {
	var server = http.createServer(app);
}

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
  console.log("Test request received");
  res.send('Hello World!');
});

	/* blog */
app.post('/blog', function(req, res) {
	var post_data = req.body;
});

app.post('/log', function(req, res) {
	var post_data = req.body;
	
	
});




server.listen(port, function () {
  console.log('Backend server listening on port '+port);
});
