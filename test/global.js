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

test('Error handling (PLEASE CHECK TRELLO)', async t => {
    const loadApp = require(path.join(root, 'src', './app'));
    let {app, modules} = loadApp({test: true, noLog: true, testSaveLogs: true});
    
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

    let files = [];
    try {
        let files = await util.promisify(fs.readdir)(path.join(root, "crashes"));
    } catch (e) {

        // Ignore ENOENT (directory doesn't exist)
        if (e.code != 'ENOENT') {
            throw e;
        }
    }

    let res2 = await request.get('/error');
    t.is(res2.status, 500);

    process.stdout.write = old_stdout;

    let newfiles = await util.promisify(fs.readdir)(path.join(root, "crashes"));

    let newfile = newfiles.filter(f => !files.includes(f));
    t.is(newfiles.length > files.length, true);

    newfile = newfile[0];
    await util.promisify(fs.unlink)(path.join(root, 'crashes', newfile))
});

test.skip('Session persistence', async t => {
    // Doesn't work
    // Please someone figure out how to make this work
    // Thanks


    let cookies;

    const loadApp1 = require(path.join(root, 'src', './app'));
    let app1 = loadApp1({noLog: true, testSaveLogs: true, noServ: true});
    
    let supertest = require('supertest');
    const request1 = supertest.agent(app1.app);

    let res = await request1.post('/auth/login').send({
        username: 'root',
        password: 'OneServ_2017'
    })
    t.is(res.status, 200)
    cookies = res.header['set-cookie'];

    let res2 = await request1.get('/auth/check');
    t.is(res2.status, 200);
    t.is(res2.body.logged, true);

    const loadApp2 = require(path.join(root, 'src', './app'));
    let app2 = loadApp2({noLog: true, testSaveLogs: true, noServ: true});
    
    const request2 = supertest.agent(app2.app);

    let res3 = await request2.get('/auth/check').set('Cookie', cookies);
    t.is(res3.status, 200);
    t.is(res3.body.logged, true);
});