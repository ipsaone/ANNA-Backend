'use strict';

process.env.TEST = true;

const test = require('ava');

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');
const util = require('util');
const fs = require('fs');

const supertest = require('supertest');

test('Real startup smoke test', async t => {
    let old_stdout = process.stdout.write;
    process.stdout.write = chunk => {}; // NOM NOM EAT ALL THE OUTPUT

    const loadApp = require(path.join(root, 'src', './app'));
    let {app, modules} = loadApp();
    
    const request = require('supertest').agent(app);

    let res = await request.get('/');
    t.is(res.status, 200);

    process.stdout.write = old_stdout;
});

test('Error handling', async t => {
    const loadApp = require(path.join(root, 'src', './app'));
    let {app, modules} = loadApp({test: true, noLog: true});
    
    const request = require('supertest').agent(app);
    const db = await modules.syncDB();

    t.context.user = await db.User.create({
        username: 'login_test',
        password: 'password_test',
        email: 'test@test.com'
    })

    let res = await request.post('/auth/login').send({
        username: 'login_test',
        password: 'password_test'
    })
    t.is(res.status, 200)

    let old_stdout = process.stdout.write;
    process.stdout.write = chunk => {}; // NOM NOM EAT ALL THE OUTPUT

    let res2 = await request.get('/error');
    t.is(res2.status, 500);

    process.stdout.write = old_stdout;

    let files = await util.promisify(fs.readdir)(path.join(root, "crashes"));

    // sleep five seconds
    await new Promise(resolve=>{
        setTimeout(resolve, 5000);
    });

    let newfiles = await util.promisify(fs.readdir)(path.join(root, "crashes"));
    t.is(newfiles.length > files.length, true);
})
