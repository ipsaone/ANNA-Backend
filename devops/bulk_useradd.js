'use strict';

const findRoot = require('find-root');
const path = require('path');
const util = require('util');
const root = findRoot(__dirname);
const fs = require('fs');
const inquirer = require('inquirer');
const superagent = require('superagent');
const joi = require('joi');


let group;
let request;

const schema = joi.object().keys({
    username: joi.string().min(4).required(),
    email: joi.string().min(5).required(),
    password: joi.string().min(6)
});

async function main() {

    // Check arguments
        // PATH
    if(process.argv.length < 3) { 
        console.log('Usage : node bulk_useradd.js PATH [OPTIONS]');
        process.exit(-1);
    }
    const file = process.argv[2];
    let online_url = "";
        // OPTIONS
    if(process.argv.length > 3) {
        for(let i = 3; i < process.argv.length; i++) {
            switch(process.argv[i-1]) {
                case '--online': {
                    if(!process.argv[i]){ 
                        console.log('--online needs a parameter.');
                        console.log('example : node bulk_useradd.js ./test --online localhost:8888')
                    }

                    online_url = process.argv[i];
                    i++;
                    break;
                }
            }
        }
    }
    
    // Get connection
    if(online_url) {
        if(online_url[online_url.length - 1] == '/') {
            online_url = online_url.substr(0, online_url.length - 1);
        }
        request = require('supertest').agent(online_url);
    } else {
        // Initialize backend
        const loadApp = require(path.join(root, 'src', './app'));
        let {app, modules} = loadApp({noLog: true});
        request = require('supertest').agent(app);
        const db = modules.db;
    }

    // Throttle requests
    const Throttle = require('superagent-throttle');
    let throttle = new Throttle({
        active: true,     // set false to pause queue
        rate: 100,          // how many requests can be sent every `ratePer`
        ratePer: 60000,   // number of ms in which `rate` requests may be sent
        concurrent: 20     // how many requests can be sent concurrently
    });
    request.use(throttle.plugin());

    // Get credentials
    // That's not done on the command-line because of the security risk !
    let {username, password} = await inquirer.prompt([
        {type: "input", name: "username", message: "Username :"},
        {type: "password", name: "password", message: "Password :"}
    ]);
    let login_req = await request.post('/auth/login').send({username, password});
    if(login_req.status != 200) { 
        console.error("Login failure ( error ", login_req.status, ":", login_req.body, ")");
        process.exit(-1);
    }
    console.log("Login OK");
    let login = login_req.body;

    // Read users and check
    let users = JSON.parse(await util.promisify(fs.readFile)(file));
    users = users.filter(u => {
        const validation = schema.validate(u);
        if (validation.error) {
            console.log('Schema validation failed for user', u.username, ":", validation.error);
            return false;
        }
        return true;
    })

    // Confirm
    console.log(users);
    let {go} = await inquirer.prompt([
        {type: "confirm", message: "Insert those users ?", name: "go"}
    ]);
    if(!go) { process.exit(0); }
    
    

    // Insert
    for(const user of users) {
        let res = await request.post('/users/').send(user);
        if(res.status != 201) {
            console.log("Error inserting", user.name, ":", res.body);
        }
    }
    console.log("Done !")
    
}



(async () => {
    try {
        await main();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(-1);
    }
})();
