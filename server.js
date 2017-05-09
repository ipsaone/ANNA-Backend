// Dependencies
var express = require('express')
var fs      = require('fs')
var https   = require('https');

// HTTPS
var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};


// Initialization
var app = express()
var server = https.createServer(credentials, app);


// Routing
app.get('/', function (req, res) {



  res.send('Hello World!');
});



server.listen(8080, function () {
  console.log('Backend server listening on port 8080');
});
