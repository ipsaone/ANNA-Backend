
	/*
	DRIVE REQUEST POST PARAMETERS :
		- type [str] : 
			"LIST", to list all files (and directories) in a folder
			"UPLD", to upload a new file
			"EDIT", to change the contents of a file or its metadata
			"META", to get the file metadata
			"MOVE", to move a file
			"MKDR", to create a new directory
			"DWNL", to download a file
		- target [nbr] : the file or directory ID, 1 for root (/)
		- changes [obj] : the attributes to edit (type="EDIT" only)
			object fields : to be determined
		- destination [int] : the directory ID of the destination 
							  (type="MOVE" only)
		- edition [nbr] : the file edition ID (optionnal, type="DWNL" only)

	DRIVE RESPONSE FIELDS :
		- code [int] : the response code (see header)
		- files [arr(obj)] : the list of files (type="LIST" only)
			object fields : id [int], filename [str], rights [int], filetype [str], 
							filesize [int], owner_name [str], is_directory [bool]
		- dirtree [arr(obj)] : the current position in the directory tree 
							   (type="LIST" only)
			object fields : dir_id [int], dir_name [str]
		- file [obj] : the file to download (type="META" only)
			object fields : filename [str], rights [int], filetype [str], 
							filesize [int], owner_id [int]

	*/

var pool = null;
var rights = {READ : 4, WRITE : 2}
var fs = require("fs")
var getFolderSize = require("get-folder-size");
var formidable = require('formidable');
var util = require('util');
var mv = require('mv');
var mime = require("mime-types");
var async = require('async');

module.exports = function(pool_glob) {
	pool = pool_glob;
	return handleRequest;
	
}

var handleRequest= function(req, res) {
	if (req.method == "POST") {
		handlePost(req, res);
	}

	else if (req.method == "GET") {
		handleGet(req, res);
	}
}

function handleGet (req, res) {
	 if (typeof(req.query.fileid) == "undefined") {
	 	res.json({code: 21});
	 	return;
	 }

	 var fileid = req.query.fileid;

	 // Check read permissions
		checkPermissions(req.session.user_ID, fileid, rights.READ, function(err, accept) {
			if (err) {
				console.error(err);
				res.json({code : 31})
				return;
			}

			if (accept) {
				// Get needed data
				var sql = "SELECT drive_files.filename, drive_edits.archive_path, drive_edits.edition_time FROM drive_files INNER JOIN drive_edits ON drive_files.ID = drive_edits.file_ID WHERE drive_files.ID = ? AND drive_edits.archive_exists = 1 ORDER BY drive_edits.edition_time DESC";
				pool.query(sql, [fileid], function(err1, res1, fields1) {
					if (err1) {
						console.error(err1),
						res.json({code: 31});
						return;
					}

					if (res1.length == 0) {
						res.json({code: 23});
						return;
					}

					else {
						var file = res1[0];
						var path = require('path').join(process.cwd(), '..', 'drive', file.archive_path);

						// Stream file
						res.download(path, file.filename, function(err2) {
							if (err2) {
								console.error(err2);
								return;
							}
						})
					}	

					
				})


				
			}

			else {
				// Send an error
				res.json({code: 12})
			}

		});

}


function handlePost (req, res) {
	var post_data = req.body;


	var form = new formidable.IncomingForm();
	form.multiples = true;
	form.parse(req, function(err2, fields, files) {
		 if (err2) {
            console.log(err2);
            return;
        }

        if (typeof fields.target !== "string") {
        	// TODO : custom error
        	console.log("Bad target type");
        	res.json({code: 22})
        	return;
        }
        
        // Get data
        var folder = parseInt(fields.target)



        // Check rights
        checkPermissions(req.session.user_ID, folder, rights.READ, function(err, accept) {
        	if (err) {
        		console.error(err);
				res.json({code : 32});
				return;
        	}

        	if (accept) {


        		var wrappers = [];
        		
        		if (files.upload instanceof Array ) {
	        		for (var i = 0; i < files.upload.length; i++) {
	        			wrappers.push({
	        				userID : req.session.userID,
	        				targetFolder : folder,
	        				file: files.upload[i]
	        			});
	        		}
	        	} else {
	        		wrappers.push({
	        			userID : req.session.userID,
        				targetFolder : folder,
        				file: files.upload
	        		})
	        	}

        		async.each(wrappers, handleUpload, function(err) {
        			if(err) {
        				console.log(err);
        				res.json({code: 32});
        				return;
        			}

        			res.json({code: 1});
        			return;
        			
        		})
	        	
        		
        	}

        	else {

        	}
        	


        });
        
        	
      
	});
	
	

	switch (post_data.type) {
		case "LIST" :
			// Authorization check
			checkPermissions(req.session.user_ID, post_data.target, rights.READ, function(err, accept) {
				if (err) {
					console.error(err);
					res.json({code : 31})
					return;
				}

				if (accept) {
					getDirectoryListing(post_data.target, function(err, files) {
						// Get directory tree
						var dirtree = [];
						getDirectoryTree(post_data.target, dirtree, function(err) {
							// Send the answer
							res.json({code : 1, files : files, dirtree : dirtree})
							return;
						});
					});
				}
				else {
					res.json({code : 12})
					return;
				}
				
			});

			break;

		case "EDIT" :
			// Check write permissions
				// Stream file or change db entry
			break;

		case "META" :
			// Check read permissions
				// Send response
			break;

		case "MOVE" :
			// Check write permissions
				// Change db entry
			break;
	}

}

function handleUpload(fileWrapper, cb) {
	// Move file
	var dir = require('path').join(process.cwd(), '..', 'drive');
	fs.readdir(dir, function(err2, files) {
		if (err2) {
			cb(err2);
			return;
		}


		var fileno = files.length;
		var target_folder_rel = require('path').join('/', fileno.toString(), fileWrapper.file.name);
		var target_folder = require('path').join(process.cwd(), '..', 'drive', target_folder_rel);
		mv(fileWrapper.file.path, target_folder, {mkdirp: true}, function(err3) {
			if (err3) {
				cb(err3);
				return;
			}



			// Add file entry in db			
			getUserGroups(fileWrapper.userID, function(err4, groups) {
				if (err4) {
					cb(err4)
					return;
				}

				var sql = "INSERT INTO drive_files VALUES (NULL, ?, ?, 666, ?, ?, 0)"
				pool.query(sql, [fileWrapper.file.name, fileWrapper.userID, groups[0], fileWrapper.targetFolder], function(err5, rows, columns) {
					if (err5) {
						cb(err5);
						return;
					}

					// Add file edit entry in db 
					var sql2 = "INSERT INTO drive_edits VALUES(NULL, ?, ?, NOW(), 1, ?, 'CREATION')"
					pool.query(sql2, [rows.insertId, fileWrapper.userID, target_folder_rel], function(err6, rows2, columns2) {
						if (err6) {
							cb(err6);
							return;
						}


						cb();
						return;


					})

				})

				
			})
			
		})
	});

}

function checkPermissions(user_ID, file_ID, right_code, callback) {
	var sql = "SELECT * FROM drive_files WHERE ID = ?"
	pool.query(sql, [file_ID], function(err, res, fields) {
		if (err) {
			callback(err);
			return;
		}

		if (res.length == 1) {
			var file = res[0];

			// Check if the current user is the owner	
			if (user_ID == file.owner_ID) {
				var cur_rights = parseInt(String(file.rights).charAt(0))
				accept_cb(null, checkRight(cur_rights, right_code));
			}

			else {

				var sql = "SELECT * FROM users_groups WHERE user_ID = ?"
				pool.query(sql, [user_ID], function(err1, res1, fields1) {
					if (err1) {
						callback(err1);
					}

					if (res1.length != 0) {
						var user_groups = [];
						for(var i = 0; i < res1.length; i++) {
							user_groups.push(res1[i].group_ID)
						}

						// Check if the current user is in the file group
						if (user_groups.indexOf(res1[0].group_ID) > -1) {
							var cur_rights = parseInt(String(file.rights).charAt(1))
							callback(null, checkRight(cur_rights, right_code));

						}
					}

					

					// Check other rights
					else {
						var cur_rights = parseInt(String(file.rights).charAt(2))
						callback(null, checkRight(cur_rights, right_code));
					}
				})

			}

		}

		else {

			if (res.length != 0) {
				console.error("SQL Query error : too many results !!")
				console.trace();
			}

			// TODO : Custom exception class
			callback(-1);
		}

	});

}


function checkRight(code, right) {
	return !!(code & right);

}

function getDirectoryTree(folder_ID, destination, callback) {

	var sql = "SELECT * FROM drive_files WHERE ID = ?"
	pool.query(sql, [folder_ID], function(err3, res3, fields3) {
		if (err3) {
			callback(err3)
		}

		if (res3.length == 0) {
			console.error("Folder "+folder_ID+" not found !")
			// TODO : Custom exception class
			callback(-1);
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
				callback(null);
				return;
			} else if (typeof(cur_folder.directory_ID) !== "undefined" ) {
				getDirectoryTree(cur_folder.directory_ID, destination, callback);
			} else {
				console.error("Folder "+cur_folder.ID+" has no parent !");
				// TODO : Custom exception class
				callback(-1);
				return;
			}
			

		}

		else {
			console.error("SQL Query error : too many results !!");
			// TODO : Custom exception class
			callback(-1);
			return;
		}


	})

}

function getSize(filepath, cb) {
	fs.stat(filepath, function(err4, res4) {
		if (err4) {
			cb(err4);
			return;
		}

		if (res4.isDirectory()) {
			getFolderSize(filepath, function(err5, res5) {
				if (err5) {
					cb(err5);
					return
				} else {
					filesize = res5;
				}

				cb(null, filesize);
			});
		} else if (res4.isFile()) {
			filesize = res4.size;
			cb(null, filesize)
		}
	});

}

function getDirectoryListing(folderID, cb) {
	var sql = "SELECT * FROM drive_files WHERE ID = ?"
	pool.query(sql, [folderID], function(err1, res1, fields1) {
		if (err1) {
			cb(err1)
			return;
		}


		// Folder not found
		if(res1.length == 0) {cb('Folder not found'); return; }

		// Folder found
		else if(res1.length == 1){
			if (!res1[0].is_directory) {
				// TODO : Custom exception class
				cb('Folder is directory');
				return;
			}

		
			var sql = "SELECT drive_files.*, users.username as owner_name FROM drive_files INNER JOIN users ON drive_files.owner_ID=users.ID WHERE directory_ID = ?"
			pool.query(sql, [res1[0].ID], function(err2, res2, fields2) {
				if (err2) {
					cb(err2);
					return;
				}

				// Get files in the directory
				var files = [];

				async.each(res2, function(curfile, cb2) {
					if(curfile.ID == 1){
						cb2(); 
						return;
					}

					var sql = "SELECT * FROM drive_edits WHERE file_ID = ? ORDER BY edition_time DESC"
					pool.query(sql, [curfile.ID], function(err3, res3, fields3) {
						if (err3) {
							console.error(err3);
							return;
						}

						if (res3.length == 0) {
							console.error("No drive edit found...");
							// Ignore file in listing
							return;
						}

						else {
							var last_archive = "";
							for (var j = 0; j < res3.length; j++) {
								if (res3[j].archive_exists) {
									last_archive = res3[j].archive_path;
									break;
								}
							}


							var filesize = 0;
							var filetype = "";
							if (last_archive != "") {
								
								var filepath = require('path').join(process.cwd(), '..', 'drive', last_archive);
								
								fs.stat(filepath, function(err4, res4) {
									if (err4) {
										console.error(err4);
										return;
									}

									if (res4.isFile()) {
										filesize = res4.size;

										files.push({
											id : curfile.ID,
											filename : curfile.filename,
											rights : curfile.rights,
											filetype : filetype, // TODO
											filesize : filesize,
											is_directory: curfile.is_directory,
											owner_name : curfile.owner_name
										})
										cb2();
										return;

									}

									else { // !res4.isFile()
										cb2('Requested size for folder');
										return;
									}


								});



							}



						} 

					});
				}, function(err3) {
					if (err3) {
						cb(err3);
						return;
					}

					cb(null, files);
					return;
				})

			});
		}
		
		// Multiple folders found
		else {
			cb("SQL Query error : too many results !!")
			return;
		}
	})

}

function getUserGroups(userID, cb) {
	var sql = "SELECT group_ID FROM users_groups WHERE user_ID = ?"
	pool.query(sql, [userID], function(err, rows, columns) {
		if (err) {
			cb(err);
			return;
		}

		var groups = rows.map(s => s.group_ID)
		cb(null, groups)
	})
}