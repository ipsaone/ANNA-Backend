
	/*
	DRIVE REQUEST POST PARAMETERS :
		- type [str] : 
			"LIST", to list all files (and directories) in a folder
			"DWNL", to download the contents of a file
			"UPLD", to upload a new file
			"EDIT", to change the contents of a file or its metadata
			"META", to get the file metadata
			"MOVE", to move a file
		- target [nbr] : the file or directory ID, 0 for root (/)
		- changes [obj] : the attributes to edit (type="EDIT" only)
			object fields : to be determined
		- destination [int] : the directory ID of the destination 
							  (type="MOVE" only)

	DRIVE RESPONSE FIELDS :
		- code [int] : the response code (see header)
		- files [arr(obj)] : the list of files (type="LIST" only)
			object fields : filename [str], rights [int], filetype [str], 
							filesize [int], publisher_name [str]
		- dirtree [arr(obj)] : the current position in the directory tree 
							   (type="LIST" only)
			object fields : dir_id [int], dir_name [str]
		- file [obj] : the file to download (type="DWNL" only)
			object fields : filename [str], rights [int], filetype [str], 
							filesize [int], publisher_id [int], contents [str]

	*/

var pool = 0;
module.exports = function(pool_glob) {
	pool = pool_glob;
	return {handleRequest}
}

var handleRequest = function(req, res) {
	var post_data = req.body;
	if(!checkToken(req)) {
		res.send(JSON.stringify({success: false, errcode: 10}))
		return;
	}

	switch (post_data.type) {
		case "LIST" :
			var sql = "SELECT * FROM drive_files WHERE ID = ?"
			pool.query(sql, [post_data.target], function(err1, res1, fields1) {
				if (err1) {
					console.error('SQL query error : ' + err.message);
					if(localhost){console.log(err.stack);}
					res.json({code: 31});
					return;
				}

				// File not found
				if(res1.length == 0) { 
					res.json({accept: false, code: 23});
				}

				// File found
				else if(res1.length == 1){
					if (!res1[0].is_directory) {
						res.json({code: 24});
					}

					var rights = res1[0].rights
					var sql = "SELECT * FROM user_groups WHERE user_ID = ?"
					pool.query(sql, [req.session.userID], 
							   function(err2, res2, fields2) {

						if (err2) {
							console.error('SQL query error : ' + err.message);
							if(localhost){console.log(err.stack);}
							res.json({code: 31});
							return;
						}

					});

					// Check if the current user is the owner
					if (res1[0].owner_ID == req.session.userID) {

					}

					// Check if the current user is in the file group
					else if (true) {

					}

					// Check other rights


				}
				
				// Multiple files found
				else {
					console.error("SQL Query error : too many results !!")
					res.json({code: 31});
					return;
				}
			})

			break;

		case "DWNL" :
			break;

		case "UPLD":
			break;

		case "EDIT" :
			break;

		case "META" :
			break;

		case "MOVE" :
			break;
	}



	res.send(true);	
}