const fs = require('fs');
const util = require('util');
const deepEqual = require('deep-equal');
const mysql = require('mysql');
const findRoot = require('find-root');
const path = require('path');
const root = findRoot(__dirname);
let exec = util.promisify(require('child_process').exec);

require('dotenv').config({path: "../.env"});
const seq_cfg = require('../src/config/config.js').sequelize;

let main = async () => {
    // Check local files
    console.log("Checking files are correct");
        // Get SHA1 from git
    let json = await util.promisify(fs.readFile)("../sha1.json");
    let sha1_before = JSON.parse(json);

        // Check SHA1
    let sha1_calculator = require('./files_sha1.js');
    let sha1_here = await sha1_calculator.compute(root, path.join(root, ".gitignore"), false);
    if(!deepEqual(sha1_before, sha1_here)) {
        console.error("Some files are different than at compilation time... !");
        process.exit(-1);
    }
    console.log("Files OK");

    // Check MYSQL service
    {
        console.log("Checking mysql service ...")
        let {stdout, stderr} = await exec("systemctl show mysql --no-page | grep SubState");
        if(stdout.search("running") === -1) {
            console.error("Failed to prove mysql is running");
            process.exit(-1);
        }
        console.log("Mysql service OK")
    }


    // Check MYSQL connectivity
    console.log("Checking mysql connection ...");
    let conn_obj = {
        host: seq_cfg.host,
        user: seq_cfg.username,
        password: seq_cfg.password,
        database: seq_cfg.database,
        socketPath: seq_cfg.dialectOptions.socketPath,
    };
    const connection = mysql.createConnection(conn_obj);
    await new Promise((res, rej) => {
        connection.connect(function(err) {if(err){rej(err);} res();})
    });
    connection.destroy();
    console.log("Mysql connection OK");


    // Check REDIS service
    {
        console.log("Checking redis service...")
        let {stdout, stderr} = await exec("systemctl show redis --no-page | grep SubState");
        if(stdout.search("running") === -1) {
            console.error("Failed to prove redis is running");
            process.exit(-1);
        }
        console.log("Redis service OK");
    }

    // Check REDIS connectivity

    // Install NPM packages
    {
        console.log("Installing NPM packages...")
        let {stdout, stderr} = await exec("npm install");
        if(stdout.search("running") === -1) {
            console.error("Failed to install NPM packages");
            process.exit(-1);
        }
        console.log("NPM packages OK");
    }

    // Migrate database

    // Run tests

    // Start production manager

    // Stop old version
}

main();