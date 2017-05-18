var express = require('express');

var app = express()

app.post('/carnet_de_bord.html', function(req,res) {

	res.send('carnet_de_bord')
})

app.listen(81, function() {
	console.log('Backend server listening on port 81')
)}