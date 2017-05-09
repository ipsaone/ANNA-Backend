// Dependencies
var express = require('express');
var fs      = require('fs');
var https   = require('https');
var mysql   = require('mysql');
var bodyParser = require('body-parser');

// HTTPS
var privateKey  = fs.readFileSync('sslcert/key.pem', 'utf8');
var certificate = fs.readFileSync('sslcert/cert.pem', 'utf8');
var credentials = {key: privateKey, cert: certificate};


// Initialization
var app = express()
var server = https.createServer(credentials, app);

// Middleware
app.use(bodyParser.urlencoded({extended: true}));

// Routing
	/* test */
app.get('/login', function (req, res) {


	
  res.send('Hello World!');
});

	/* blog */
app.post('/blog', function(req, res) {
	var post_data = req.body;
	console.log(post_data);
});


server.listen(8080, function () {
  console.log('Backend server listening on port 8080');
});
