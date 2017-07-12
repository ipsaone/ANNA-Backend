	/*
	LOG REQUEST POST PARAMETERS :
		- type [str] :
			"TASKS", to get current tasks data
			"MSG", to get the Message of the Day
			"UPDTS", to get latest updates
			"STATS", to get today's tasks statistics

	LOG RESPONSE FIELDS :
		- code [int] : the response code (see header)
		- tasks [arr(obj)] : the currents tasks (type="TASKS" only)
			object fields :  name [str], percentage [int]
		- message [obj] : the Message of the Day (type="MSG" only)
			object fields : msg [str], publisher_name [str], timestamp [int], 
							publisher_groups [arr(str)]
		- updates [arr(obj)] : the latest updates (type="UPDTS" only)
			object fields : action [str], timestamp [int], publisher_name [str], 
							publisher_groups [arr(str)]
		- stats [obj] : the tasks statistics (type="STATS" only)
			object fields : tasks_per_day [int], tasks_objective [int], 
							tasks_data [arr(obj)]
				tasks_data object fields : month [int], day [int], tasks [int]

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

	res.send(true);	
	
}