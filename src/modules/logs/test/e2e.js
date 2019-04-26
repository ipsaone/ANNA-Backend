'use strict'

process.env.TEST = true;

const test = require('ava');

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');

const supertest = require('supertest');

test.todo("Fix all tests of this file")

/*

test.beforeEach(async t => {
    const loadApp = require(path.join(root, 'src', './app'));
    let {app, modules} = loadApp({test: true, noLog: true});
    const request = require('supertest').agent(app);

    const db = await modules.syncDB();

    t.context.app = app;
    t.context.db = db;
    t.context.request = request;

    t.context

    t.context.user = await db.User.create({
        username: 'login_test',
        password: 'password_test',
        email: 'test@test.com'
    })
    t.context.group = await db.Group.create({
        name: "root"
    });
    await t.context.user.addGroup(t.context.group.id);

    let res = await request.post('/auth/login').send({
        username: 'login_test',
        password: 'password_test'
    })

    t.is(res.status, 200)
})

test('Log addition', async t => {
    let res = await t.context.request.post('/logs')
        .send({
            title: "test",
            markdown: "#TEST"
        })

    t.is(res.status, 201);
    t.is(res.body.title, 'test');
});

test('List logs', async t => {
    // Insert log
    let log = await t.context.db.Log.create({
            title: "test",
            markdown: "#TEST"
        })

    // Fetch
    let res = await t.context.request.get('/logs/'+log.id)
    t.is(res.status, 200);
});


test('Show log', async t => {
    // Insert log
    await t.context.db.Log.create({
            title: "test",
            markdown: "#TEST"
        })


    let res = await t.context.request.get('/logs')

    t.is(res.status, 200);
    t.is(res.body.length, 1);
});



test('Log edition', async t => {

    // Insert log
    let log = await t.context.db.Log.create({
            title: "test_283",
            markdown: "#TEST",
            authorId: t.context.user.id
        })

    // Edit log (success)
    let successRes = await t.context.request.put('/logs/'+log.id)
        .send({
            markdown: '#EDITED_TEST'
        })

    t.is(successRes.status, 202);
    t.is(successRes.body.markdown, '#EDITED_TEST')

    // Edit log (failure)
    let failureRes = await t.context.request.put('/logs/'+log.id)
        .send({
            content: 'I HAVE BEEN EDITED'
        })

    t.is(failureRes.status, 401)
});



test('Log deletion', async t => {
    // Insert log
    let log = await t.context.db.Log.create({
            title: "test_283",
            markdown: "#TEST"
        })
    let insertId = log.id;

    // Delete log
    let res = await t.context.request.delete('/logs/'+insertId);
    t.true(res.status == 204);


});
*/