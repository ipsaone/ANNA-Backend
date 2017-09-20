
	/*
	LOGIN REQUEST POST PARAMETERS :
		- username [str] : the name of the user who wants to login
		- password [str] : the password of the user

	LOGIN RESPONSE FIELDS :
		- code [int] : the response code (see header)
		- accept [bool] : whether the login request is accepted
	*/


let bcrypt = require('bcrypt-nodejs');
let assert = require('assert');
let handleError = require('./error').parse;
let BackendError = require('./error').BackendError;
var pool = 0;

module.exports = function(pool_glob) {
	pool = pool_glob;
	return handleRequest
}

var handleRequest = function(req, res) {
	// data gathering
	let post_data = req.body;
	let username = post_data.username;
	let password = post_data.password;


	// mysql user/pwd checking
	var sql = 'SELECT * FROM users WHERE LOWER(username) = LOWER(?)'
	pool.query(sql, [username], function(err1,res1,fields1){
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
					console.error('error comparing BCrypt : '+err.message);
					if(localhost){console.log(err.stack);}
					res.json({accept: false, code: 32});
					return;
				}

				// Hashes match
				if (res2) {
					
					// response sending
					req.session.userID = res1[0].ID;					
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
}
