var mysql = require("mysql")

var pool = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : 'OneServ_2017',
  database : 'testing',
  queueLimit : 20
});

var serverLogin = require("../server/server_login")(pool);


