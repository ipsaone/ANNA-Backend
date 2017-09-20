
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
			"DEL", to delete a file or directory
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
							filesize [str], owner_name [str], is_directory [bool]
		- dirtree [arr(obj)] : the current position in the directory tree 
							   (type="LIST" only)
			object fields : dir_id [int], dir_name [str]
		- file [obj] : the file to download (type="META" only)
			object fields : filename [str], rights [int], filetype [str], 
							filesize [str], owner_id [int]

	*/

let pool = null;
let rights = {READ : 4, WRITE : 2}
let fs = require("fs")
let getFolderSize = require("get-folder-size");
let formidable = require('formidable');
let util = require('util');
let mv = require('mv');
let mime = require("mime-types");
let async = require('async');
let BackendError = require('./error').BackendError;
let handleError = require('./error').parse;
let assert = require('assert')

let mmm = require('mmmagic').Magic
let fileType = new mmm();

module.exports = function(pool_glob) {
	pool = pool_glob;
	return handleRequest;
	
}

function handleRequest(req, res) {
	if (req.method == "POST") {
		handlePost(req, res, handleError);
	}

	else if (req.method == "GET") {
		handleGet(req, res, handleError);
	}
}

function handleGet (req, res, errHandler) {
	 if (typeof(req.query.fileid) == "undefined") {
	 	res.json({code: 21});
	 	return;
	 }

	 let fileid = req.query.fileid;

	 // Check read permissions
	checkPermissions(req.session.userID, fileid, rights.READ, function(err, accept) {
		errHandler(err, req, res, function() {
			if (accept) {
				// Get needed data
				let sql = "SELECT drive_files.filename, drive_edits.archive_path, drive_edits.edition_time FROM drive_files INNER JOIN drive_edits ON drive_files.ID = drive_edits.file_ID WHERE drive_files.ID = ? AND drive_edits.archive_exists = 1 ORDER BY drive_edits.edition_time DESC";
				pool.query(sql, [fileid], function(err1, res1, fields1) {
					errHandler(err1, req, res, function() {
						if (res1.length == 0) {
							errHandler(new BackendError(23), req, res);
						}

						else {
							let file = res1[0];
							let path = require('path').join(process.cwd(), '..', 'drive', file.archive_path);

							// Stream file
							res.download(path, file.filename, function(err2) {
								errHandler(err2, req, res);
							})
						}	
					})					
				})


				
			}

			else {
				// Send an error
				errHandler(new BackendError(12), req, res);
			}
		})
	});

}


function handlePost (req, res, errHandler) {
	let post_data = req.body;

	
	let form = new formidable.IncomingForm();
	form.parse(req, function(err2, fields, files) {
		errHandler(err2, req, res, function() {
			if (typeof fields.target !== "string") {
				errHandler(new BackendError(22), req, res);
	        }
	        
	        // Get data
	        let folder = parseInt(fields.target)



	        // Check rights
	        checkPermissions(req.session.userID, folder, rights.READ, function(err3, accept) {
	        	errHandler(err3, req, res, function() {
	        		if (accept) {
		        		let wrapper = {
			        			userID : req.session.userID,
		        				targetFolder : folder,
		        				file: files.upload
			        		}

		        		handleUpload(wrapper, function(err4) {
		        			errHandler(err4, req, res, function() {
			        			res.json({code: 1});
			        			return;
		        			})
		        		});
			        	
		        		
		        	}

		        	else {
		        		errHandler(new BackendError(12), req, res);
		        		return;
		        	}
	        	});        	


	        });
		})
        
        	
      
	});
	
	
	

	switch (post_data.type) {
		case "LIST" :
			// Authorization check
			checkPermissions(req.session.userID, post_data.target, rights.READ, function(err, accept) {
				errHandler(err, req, res, function() {
					if (accept) {
						getDirectoryListing(post_data.target, function(err2, files) {
							errHandler(err2, req, res, function() {

								// Get directory tree
								let dirtree = [];
								getDirectoryTree(post_data.target, dirtree, function(err3) {
									errHandler(err3, req, res, function() {

										// Send the answer
										res.json({code : 1, files : files, dirtree : dirtree})
										return;
									});
								});
							})
						});
					}
					else {
						res.json({code : 12}); // This triggers even when connected ...
						return;
					}
				})

				
				
			});

			break;

		case "EDIT" :
			// Check write permissions
				// Stream file or change db entry
			break;

		case "META" :
			// Check read permissions
			/*
			checkPermissions(req.session.userID, post_data.target, rights.READ, function(err, accept) {
				errHandler(err, req, res, function() {
					if (accept) {

					}
				}
			}
			*/
			break;

		case "MOVE" :
			// Check write permissions
				// Change db entry
			break;
	}

}

function getFileMeta(fileID, cb) {
	let sql = "SELECT drive_files.*, users.username as owner_name FROM drive_files INNER JOIN users ON drive_files.owner_ID = users.ID WHERE drive_files.ID = ?";
	pool.query(sql, [fileID], function(err, res, fields) {
		if (err) {
			cb(err);
			return;
		}

		if (res.length == 0) {
			cb('File not found');
		}

		assert(res.length <= 1, "Multiple files with the same ID : "+fileID+". Database cleanup needed.");
		let file = res[0];

		let sql2 = "SELECT * FROM drive_edits WHERE file_ID = ? ORDER BY edition_time DESC"
		pool.query(sql2, [fileID], function(err3, res3, fields3) {
			if (err3) {
				cb(err3);
				return;
			}

			assert (res3.length > 0, "No drive edit found for file ID "+fileID+". Database cleanup needed.");

			let last_archive = "";
			for (let j = 0; j < res3.length; j++) {
				if (res3[j].archive_exists) {
					last_archive = res3[j].archive_path;
					break;
				}
			}


			let filetype = "";
			if (last_archive != "") {
				
				let filepath = require('path').join(process.cwd(), '..', 'drive', last_archive);
				
				fs.stat(filepath, function(err4, res4) {
					if (err4) {
						console.log(err4);
						return;
					}

					assert(res4.isFile(), "Folder saved as archive for file ID "+file.ID+". Database cleanup needed.")

					if (res4.isFile()) {
						fileType.detectFile(filepath, function(err5, filetype) {
							if (err5) {
								console.log(err5);
								return;
							} 
							let filesize = res4.size;

							cb(null, {
								id : file.ID,
								filename : file.filename,
								rights : file.rights,
								filetype : filetype, 
								filesize : filesize,
								is_directory: file.is_directory,
								owner_name : file.owner_name
							})
							return;
						})
					}

					else { // !res4.isFile()
						cb('Requested size for folder');
						return;
					}
				});
			}

		});
	})
	
}

function handleUpload(fileWrapper, cb) {
	// Move file
	let dir = require('path').join(process.cwd(), '..', 'drive');
	fs.readdir(dir, function(err2, files) {
		if (err2) {
			cb(err2);
			return;
		}


		let fileno = files.length;
		let target_folder_rel = require('path').join('/', fileno.toString(), fileWrapper.file.name);
		let target_folder = require('path').join(process.cwd(), '..', 'drive', target_folder_rel);
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

				let sql = "INSERT INTO drive_files VALUES (NULL, ?, ?, 666, ?, ?, 0)"
				pool.query(sql, [fileWrapper.file.name, fileWrapper.userID, groups[0], fileWrapper.targetFolder], function(err5, rows, columns) {
					if (err5) {
						cb(err5);
						return;
					}

					// Add file edit entry in db 
					let sql2 = "INSERT INTO drive_edits VALUES(NULL, ?, ?, NOW(), 1, ?, 'CREATION')"
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

function checkPermissions(user_ID, file_ID, right_code, cb) {
	for( let s of [user_ID, file_ID, right_code] ) {
		if (typeof(s) == "undefined") {
			cb(null, false);
			return;
		}
	}


	let sql = "SELECT * FROM drive_files WHERE ID = ?"
	pool.query(sql, [file_ID], function(err, res, fields) {
		if (err) {
			cb(err);
			return;
		}

		assert(res.length == 1, "Multiple files with the same ID :"+file_ID+". Database cleanup needed")

		let file = res[0];

		// Check if the current user is the owner	
		if (user_ID == file.owner_ID) {
			let cur_rights = parseInt(String(file.rights).charAt(0))
			cb(null, checkRight(cur_rights, right_code));
		}

		else {

			let sql = "SELECT * FROM users_groups WHERE user_ID = ?"
			pool.query(sql, [user_ID], function(err1, res1, fields1) {
				if (err1) {
					cb(err1);
				}

				assert(res1.length > 0, "No group for user ID "+user_ID+". Database cleanup needed.")

				let user_groups = [];
				for(let i = 0; i < res1.length; i++) {
					user_groups.push(res1[i].group_ID)
				}

				// Check if the current user is in the file group
				if (user_groups.indexOf(res1[0].group_ID) > -1) {
					let cur_rights = parseInt(String(file.rights).charAt(1))
					cb(null, checkRight(cur_rights, right_code));

				}

				

				// Check other rights
				else {
					let cur_rights = parseInt(String(file.rights).charAt(2))
					cb(null, checkRight(cur_rights, right_code));
				}
			})

		}

	

	});

}


function checkRight(code, right) {
	return !!(code & right);

}

function getDirectoryTree(folder_ID, destination, cb) {
	let sql = "SELECT * FROM drive_files WHERE ID = ?"
	pool.query(sql, [folder_ID], function(err3, res3, fields3) {
		if (err3) {
			cb(err3)
		}

		assert(res3.length <= 1, "Multiple files with the same ID : "+folder_ID+". Database cleanup needed.")

		if (res3.length == 0) {
			console.error("Folder "+folder_ID+" not found !")
			// TODO : Custom exception class
			cb(-1);
			return;
		}

		
		let cur_folder = res3[0]

		let folder_data = {
			dir_id : cur_folder.ID,
			dir_name : cur_folder.filename
		};
		destination.push(folder_data);

		if(cur_folder.ID == 1) {
			cb(null);
			return;
		} else if (typeof(cur_folder.directory_ID) !== "undefined" ) {
			getDirectoryTree(cur_folder.directory_ID, destination, callback);
		} else {
			console.error("Folder "+cur_folder.ID+" has no parent !");
			cb(new BackendError(31));
			return;
		}
			

		


	})

}

function getDirectoryListing(folderID, cb) {
	let sql = "SELECT * FROM drive_files WHERE ID = ?"
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

		
			let sql = "SELECT drive_files.*, users.username as owner_name FROM drive_files INNER JOIN users ON drive_files.owner_ID=users.ID WHERE directory_ID = ?"
			pool.query(sql, [res1[0].ID], function(err2, res2, fields2) {
				if (err2) {
					cb(err2);
					return;
				}

				// Get files in the directory
				let files = [];

				async.each(res2, function(curfile, cb2) {
					if(curfile.ID == 1){
						cb2(); 
						return;
					}

					getFileMeta(curfile.ID, function(err, filedata) {
						if (err) {
							cb2(err);
							return;
						}

						files.push(filedata);
						cb2();
					})

					
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
	let sql = "SELECT group_ID FROM users_groups WHERE user_ID = ?"
	pool.query(sql, [userID], function(err, rows, columns) {
		if (err) {
			cb(err);
			return;
		}

		let groups = rows.map(s => s.group_ID)
		cb(null, groups)
	})
}