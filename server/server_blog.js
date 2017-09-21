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
			object fields : id [int], public [bool], title [str],
							banner_img_url [str], timestamp [int],
							publisher_name [str]
		- post [obj] : the blog post (type="DETAILS" only)
			object fields : id [int], public [bool], title [str], 
							timestamp [int], contents [str], publisher_id [int],
							img_ulrs [obj]
				images object fields : list_banner [str], post_banner [str]



	*/

let BackendError = require('./error').error;
let handleError = require('./error').parse;

let pool = 0;
module.exports = function(pool_glob) {
	pool = pool_glob;
	return handleRequest
}

var handleRequest = function(req, res) {
	if (req.method == "POST") {
		handlePost(req, res, handleError);
	}

	else if (req.method == "GET") {
		handleGet(req, res, handleError);
	}
}

function handlePost(req, res, errHandler) {
	let post_data = req.body;

	switch (post_data.type) {
		case "LIST" : {

				// Compute start and end position based on request.
				let start = 0;
				let limit = 10;
				if (typeof(post_data.start) !== "undefined") {
					start = parseInt(post_data.start);			}
				if(typeof(post_data.limit) !== "undefined") {
					limit = parseInt(post_data.end);
				}

				// Query database
				let sql = "SELECT ID, publisher_id, title, publication_time FROM blog ORDER BY publication_time DESC LIMIT ? OFFSET ?"
				pool.query(sql, [limit, start], function(err2, res2, fields) {
					errHandler(err2, req, res, function() {
						if(res.length == 0) {
							errHandler(new BackendError(21), req, res);
						}

						else {

							let posts = [];
							for (post in res2) {
								posts.push({
									id: post.ID,
									public: true,       // TODO
									title: post.title,
									timestamp: publication_time,
									banner_img_url: "", // TODO
									publisher_name: ""  // TODO
								});
							}



							res.json({code: 1, posts: posts});
						}
					});
				});




			break;
		}

		case "DETAILS" : {

			if(typeof(post_data.target) == "undefined") {
				errHandler(new BackendError(21), req, res); 
			}

			let sql = "SELECT ID, title, contents, publisher_id, publication_time FROM blog WHERE ID = ?";
			pool.query(sql, [parseInt(post_data.target)], function(err, res, rows) {
				errHandler(err, req, res, function() {
					if(res.length == 0) {
						errHandler(new BackendError(21), req, res);
					}

					// TODO
					// assert(res.length > 1, )

					else {
						var thispost = res[0];
						var post = {
							id : thispost.ID, 
							public : true, 
							title : thispost.title, 
							timestamp : thispost.publication_time, 
							contents : thispost.contents, 
							publisher_id : thispost.publisher_id,
							img_ulrs : ""

						};

						res.json({code: 1, post: post});
					}


				})
			})
			break;
		}
			
		

		case "EDIT" :
			break;
	}
}

function handleGet(req, res, cb) {
	res.send(true);
}