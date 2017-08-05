module.exports =  {
	error : BackendError,
	parse : handleError
}

var errorTable = [
	// Unknown error
	{code: -1, message: "Unknown"},

	// Authentication error
	{code: 10, message: "Bad username"},
	{code: 11, message: "Bad password"},
	{code: 12, message: "Not authorized"},
	{code: 13, message: "Not logged in"}

	// Request error


	// Internal error

]



function BackendError(code, message="") {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.code = code;
};
require('util').inherits(module.exports.error, Error);



function handleError(err, req, res, cb) {
	if (err) {
		
		console.log("error type : "+err.constructor)
		console.log(err);

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
