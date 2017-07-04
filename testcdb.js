var express = require('express');
var http = require("http")

var app = express();
var server = http.createServer(app);

app.get('/carnet_de_bord', function(req,res) {

	res.send('carnet_de_bord')
})

server.listen(8080, function() {
	console.log('Backend server listening on port 81')
});