'use strict'

process.env.TEST = true;

const test = require('ava');

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');

const supertest = require('supertest');

test.beforeEach(async t => {
    const loadApp = require(path.join(root, 'src', './app'));
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
        name: "authors"
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

test.todo('Store event (not authorized)');
test.todo('Update event (not aurthorized)');
test.todo('Delete event (not authorized)');
test.todo('Add user to event (not authorized)');
test.todo('Remove user from event (not authorized)');