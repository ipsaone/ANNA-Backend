'use strict'

const cannon = require('autocannon');
const config = require('../src/config/config');
const fs = require('fs');

load();
let connection = config.app.getConnection();

async function load() {
    const loadApp = require('../src/app');
    let {app, modules} = loadApp({up_cb: startTest});
}

function startTest() {
    console.log('Starting load test');
    cannon({
        url : "http://"+connection.host+":"+connection.port,
        connections: 1e4,
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
    },
        fs.appendFileSync.bind(null, "./logs/load.log")
    );
}