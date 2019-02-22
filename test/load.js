'use strict'

const cannon = require('autocannon');
const config = require('../src/config/config');
const fs = require('fs');

let connection = config.app.getConnection();
load();

function load() {
    const loadApp = require('../src/app');
    let {app, modules} = loadApp({up_cb: startTest, noLog: true});
}

function startTest() {
    console.log('Starting tests');
    let inst = cannon({
        url : "http://"+connection.host+":"+connection.port,
        connections: 1e3,
        amount: 1e4,
        headers: {'Content-type': 'application/json; charset=utf-8'},
        requests: [
            {
                path: "/auth/login",
                method: "POST",
                body: JSON.stringify({
                    username: 'root',
                    password: 'OneServ_2017'
                })
            },
        ]
    }, (err, res) => {
        if(err) { console.err(err); } 

        process.exit(0); 
    }
    );

    cannon.track(inst, {outputStream: process.stdout})

    
}