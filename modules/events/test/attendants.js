'use strict'

process.env.TEST = true;

const test = require('ava');

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');

const supertest = require('supertest');

test.beforeEach(async t => {
    const loadApp = require(path.join(root, './app'));
    let {app, modules} = loadApp({test: true, noLog: true});
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

    t.context.group = await db.Group.create({
        name: "root"
    });
    let res = await request.post('/auth/login').send({
        username: 'login_test',
        password: 'password_test'
    })
    t.is(res.status, 200);

    await t.context.user.addGroup(t.context.group.id);
    let res2 = await t.context.request.post('/events')
        .send({
            name: "test",
            markdown: "# TEST",
            maxRegistered: 10,
            startDate : Date.now().toString(),
            endDate: Date.now().toString()
        })
    t.context.event = res2.body;
    t.is(res2.status, 201);
});

test('Add and remove attendant to event', async t => {
    let res = await t.context.request.put('/events/'+t.context.event.id+'/register/'+t.context.user.id);
    t.is(res.status, 201);

    let res2 = await t.context.request.get('/events/'+t.context.event.id);
    t.is(res2.body.registered.length, 1);
    t.is(res2.body.registered[0].username, 'login_test');

    let res3 = await t.context.request.delete('/events/'+t.context.event.id+'/register/'+t.context.user.id);
    t.is(res3.status, 201);

    let res4 = await t.context.request.get('/events/'+t.context.event.id);
    t.is(res4.body.registered.length, 0);
});


test.todo('Attendant policy');