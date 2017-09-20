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


var pool = 0;
module.exports = function(pool_glob) {
	pool = pool_glob;
	return handleRequest
}

var handleRequest = function(req, res) {
	var post_data = req.body;
	if (!req.session.userID) {
		res.json({code : 12})
	}



	res.send(true);
}
