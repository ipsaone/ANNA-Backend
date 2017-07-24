
	/*
	DRIVE REQUEST POST PARAMETERS :
		- type [str] : 
			"LIST", to list all files (and directories) in a folder
			"DWNL", to download the contents of a file
			"UPLD", to upload a new file
			"EDIT", to change the contents of a file or its metadata
			"META", to get the file metadata
			"MOVE", to move a file
			"MKDR", to create a new directory
		- target [nbr] : the file or directory ID, 1 for root (/)
		- changes [obj] : the attributes to edit (type="EDIT" only)
			object fields : to be determined
		- destination [int] : the directory ID of the destination 
							  (type="MOVE" only)

	DRIVE RESPONSE FIELDS :
		- code [int] : the response code (see header)
		- files [arr(obj)] : the list of files (type="LIST" only)
			object fields : id [int], filename [str], rights [int], filetype [str], 
							filesize [int], owner_name [str], is_directory [bool]
		- dirtree [arr(obj)] : the current position in the directory tree 
							   (type="LIST" only)
			object fields : dir_id [int], dir_name [str]
		- file [obj] : the file to download (type="DWNL" only)
			object fields : filename [str], rights [int], filetype [str], 
							filesize [int], owner_id [int], contents [str]

	*/

var pool = null;
var rights = {READ : 4, WRITE : 2}

module.exports = function(pool_glob) {
	pool = pool_glob;
	return handleRequest
}

var handleRequest = function(req, res) {
	var post_data = req.body;

	switch (post_data.type) {
		case "LIST" :
			var sql = "SELECT * FROM drive_files WHERE ID = ?"
			pool.query(sql, [post_data.target], function(err1, res1, fields1) {
				if (err1) {
					console.error(err1);
					res.json({code: 31});
					return;
				}


				// Folder not found
				if(res1.length == 0) {res.json({code: 23}); return; }

				// Folder found
				else if(res1.length == 1){
					if (!res1[0].is_directory) {
						res.json({code: 24});
						return;
					}

					// Authorization check
					checkPermissions(req.session.user_ID, res1[0].ID, rights.READ, function(accepted) {
						if (accepted) {
							var sql = "SELECT drive_files.*, users.username as owner_name FROM drive_files INNER JOIN users ON drive_files.owner_ID=users.ID WHERE directory_ID = ?"
							pool.query(sql, [res1[0].ID], function(err2, res2, fields2) {
								if (err2) {
									console.error(err2);
									res.json({code: 31});
									return;
								}

								// Get files in the directory
								var files = [];
								for(var i = 0; i < res2.length; i++) {
									var curfile = res2[i]
									if(curfile.ID == 1){continue;}
									files.push({
										id : curfile.ID,
										filename : curfile.filename,
										rights : curfile.rights,
										filetype : "", // TODO
										filesize : 0,  // TODO
										is_directory: curfile.is_directory,
										owner_name : curfile.owner_name
									})
								}

								// Get directory tree
								
								var dirtree = [];
								getDirTree(res1[0].ID, dirtree, function() {
									// Send the answer
									res.json({code : 1, files : files, dirtree : dirtree})
									return;
								});
								



							});
						} else {
							res.json({code : 12})
							return;
						}
					})
				}
				
				// Multiple folders found
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

}

function checkPermissions(user_ID, file_ID, right_code, callback) {
	var sql = "SELECT * FROM drive_files WHERE ID = ?"
	pool.query(sql, [file_ID], function(err, res, fields) {
		if (err) {
			console.error(err);
			callback(false);
		}

		if (res.length == 1) {
			var file = res[0];

			// Check if the current user is the owner	
			if (user_ID == file.owner_ID) {
				var cur_rights = parseInt(String(file.rights).charAt(0))
				callback(checkRight(cur_rights, right_code));
			}

			else {

				var sql = "SELECT * FROM users_groups WHERE user_ID = ?"
				pool.query(sql, [user_ID], function(err1, res1, fields1) {
					if (err1) {
						console.error(err1);
						callback(false);
					}

					if (res1.length != 0) {
						var user_groups = [];
						for(var i = 0; i < res1.length; i++) {
							user_groups.push(res1[i].group_ID)
						}

						// Check if the current user is in the file group
						if (user_groups.indexOf(res1[0].group_ID) > -1) {
							var cur_rights = parseInt(String(file.rights).charAt(1))
							callback(checkRight(cur_rights, right_code));

						}
					}

					

					// Check other rights
					else {
						var cur_rights = parseInt(String(file.rights).charAt(2))
						callback(checkRight(cur_rights, right_code));
					}
				})

			}

		}

		else {

			if (res.length != 0) {
				console.error("SQL Query error : too many results !!")
				console.trace();
			}

			callback(false);
		}

	});
}


function checkRight(code, right) {
	return !!(code & right);
}

function getDirTree(folder_ID, destination, callback) {

	var sql = "SELECT * FROM drive_files WHERE ID = ?"
	pool.query(sql, [folder_ID], function(err3, res3, fields3) {
		if (err3) {
			console.error(err3);
			res.json({code: 31});
			return;
		}

		if (res3.length == 0) {
			console.error("Folder "+folder_ID+" not found !")
			res.json({code: 31});
			return;
		}

		else if (res3.length == 1) {
			var cur_folder = res3[0]

			var folder_data = {
				dir_id : cur_folder.ID,
				dir_name : cur_folder.filename
			};
			destination.push(folder_data);

			if(cur_folder.ID == 1) {
				callback();
				return;
			} else if (cur_folder.directory_ID) {
				getDirTree(cur_folder.directory_ID, destination, callback);
			} else {
				console.error("Folder "+cur_folder.ID+" has no parent !")
				res.json({code : 31});
				return;
			}
			

		}

		else {
			console.error("SQL Query error : too many results !!")
			res.json({code: 31});
			return;
		}


	})

}