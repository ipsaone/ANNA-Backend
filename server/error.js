module.exports =  {
	error : BackendError,
	parse : handleError
}

var errorTable = [
	// Unknown error
	{code: -1, message: "Unknown error"},

	// Authentication error
	{code: 10, message: "Bad username"},
	{code: 11, message: "Bad password"},
	{code: 12, message: "Not authorized"},
	{code: 13, message: "Not logged in"},

	// Request error
	{code: 21, message: "missing field"},
	{code: 22, message: "bad field type"},
	{code: 23, message: "not found"},
	{code: 24, message: "bad request"},

	// Internal error
	{code: 31, message: "database error"},
	{code: 32, message: "processing error"}

]



function BackendError(code, message="") {
  // Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.code = code;
  this.message = "";

  
  if(this.message == "") {
  	for(error in errorTable) {
  		if(error.code == this.code) {
  			this.message = error.message;
  		}
  	}

  	if(this.message == "") {
  		this.message = "Unkwown error";
  	}
  } else {
	this.message = message;
  }
  
};
require('util').inherits(module.exports.error, Error);



function handleError(err, req, res, cb=function(){}) {
	if (err) {
		if( err instanceof BackendError) {
			console.log("[ERROR " + err.code + " FROM "+""+"] : " + err.message);
		} else {
			console.log("[ERROR] : ", err)
		}

		if (!res.headersSent) {
			if (typeof(err.code) !== "undefined") {
				res.json({code: err.code});
			} else {
				res.json({code: 32});
			}
		}
		
		return;
	} else {
		cb();
	}
}
