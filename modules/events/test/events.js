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

    let res = await request.post('/auth/login').send({
        username: 'login_test',
        password: 'password_test'
    })

    t.is(res.status, 200);

    t.context.group = await db.Group.create({
        name: "root"
    });
})

test('Event addition (not root)', async t => {
    let res = await t.context.request.post('/events')
        .send({
            name: "test",
            markdown: "# TEST",
            maxRegistered: 10,
            startDate : Date.now().toString(),
            endDate: Date.now().toString()
        })
    t.is(res.status, 401);
});

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


test.todo('Event edition');

test.todo('Event deletion');

