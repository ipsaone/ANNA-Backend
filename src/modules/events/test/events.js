'use strict'

process.env.TEST = true;

const test = require('ava');

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');

const supertest = require('supertest');

test.beforeEach(async t => {
    const loadApp = require(path.join(root, 'src', './app'));
    let {app, modules} = loadApp({test: true, noLog: true, testfile: __filename});
    const request = require('supertest').agent(app);

    const db = await modules.syncDB();

    t.context.app = app;
    t.context.db = db;
    t.context.request = request;


    t.context.user = await db.User.create({
        username: 'login_test',
        password: 'password_test',
        email: 'test@test.com'
    })

    let res = await request.post('/auth/login').send({
        username: 'login_test',
        password: 'password_test'
    })

    t.is(res.status, 200);

    t.context.group = await db.Group.create({
        name: "root"
    });
})



test('Event addition (root)', async t => {
    
    await t.context.user.addGroup(t.context.group.id);
    let res = await t.context.request.post('/events')
        .send({
            name: "test",
            markdown: "# TEST",
            maxRegistered: 10,
            startDate : Date.now().toString(),
            endDate: Date.now().toString()
        })

    t.is(res.status, 201);
    t.is(res.body.name, 'test');
});


test('Events list', async t => {
    await t.context.user.addGroup(t.context.group.id);
    await t.context.request.post('/events')
        .send({
            name: "test",
            markdown: "# TEST",
            maxRegistered: 10,
            startDate : Date.now().toString(),
            endDate: Date.now().toString()
        })

    await t.context.request.post('/events')
        .send({
            name: "test2",
            markdown: "# TEST",
            maxRegistered: 10,
            startDate : Date.now().toString(),
            endDate: Date.now().toString()
        })

    let res2 = await t.context.request.get('/events');
    t.is(res2.status, 200);
    t.is(res2.body.length, 2);
    t.is(res2.body[1].name, 'test2')


});

test('Events details, edition and suppression', async t => {
    await t.context.user.addGroup(t.context.group.id);
    let res = await t.context.request.post('/events')
        .send({
            name: "test",
            markdown: "# TEST",
            maxRegistered: 10,
            startDate : Date.now().toString(),
            endDate: Date.now().toString()
        })
    t.is(res.status, 201);

    let res2 = await t.context.request.get('/events/'+res.body.id);
    t.is(res2.status, 200);
    t.is(res2.body.name, 'test');

    let res3 = await t.context.request.put('/events/'+res.body.id)
        .send({
            name: 'testEdited'
        });
    t.is(res3.status, 200);
    t.is(res3.body.name, 'testEdited');

    let res4 = await t.context.request.delete('/events/'+res.body.id);
    t.is(res4.status, 204);
    
    let res5 = await t.context.request.get('/events');
    t.is(res5.status, 200);
    t.is(res5.body.length, 0);

});

