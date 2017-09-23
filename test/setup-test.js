try {
	var request = require('request');               // HTTP Requests
	var express = require('express');          		// Web server
	var fs      = require('fs');               		// File system
	var https   = require('https');            		// Secure HTTP protocol
	var mysql   = require('mysql');            		// Database interface
	var bodyParser = require('body-parser');   		// X-form-data decoder
	var crypto = require('crypto');            		// Cryptography 
	var helmet = require('helmet');            		// Web server safety
	var session = require('express-session');  		// Session management
	var redis = require('connect-redis')(session); 	// Session store
	var cors = require('cors')                 		// Cross Origin Resource Sharing
	var rateLimit = require("express-rate-limit"); 	// Rate limiter (DDOS security)
} catch (err) {
	console.log("Dependencies : failed");
	process.exit(-1);
}

console.log("Dependencies : OK");

// Apache2
request("http://localhost/", function(err, res, body) {
	if (!err && res.statusCode == 200) {
		console.log("Apache2 : OK");
	} else {
		console.log("Apache2 : failed");
		process.exit(-1);
	}
});

// MySQL
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'OneServ_2017',
  database : 'ipsaone',
  waitForConnections: true,
  connectionLimit: 500
});
connection.connect(function(err) {
	if(err) {
		console.log("MySQL : failed");
		process.exit(-1);
	} else {
		console.log("MySQL : OK");
	}
})

// Redis
if(fs.existsSync('/var/run/redis/redis.sock') && fs.existsSync('/var/run/redis/redis-server.pid')) {
	console.log("Redis : OK")
} else {
	console.log("Redis : failed");
	process.exit(-1);
}

// PHPmyAdmin
request("http://localhost/phpmyadmin/", function(err, res, body) {
	if (!err && res.statusCode == 200) {
		console.log("PHPmyAdmin : OK");
	} else {
		console.log("PHPmyAdmin : failed");
		process.exit(-1);
	}
});

setTimeout(function(){process.exit(1);}, 5000);