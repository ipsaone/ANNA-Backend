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

test('Attendants limit', async t => {
    let res2 = await t.context.request.post('/events')
        .send({
            name: "test",
            markdown: "# TEST",
            maxRegistered: 0,
            startDate : Date.now().toString(),
            endDate: Date.now().toString()
        })
    t.is(res2.status, 201);

    let res = await t.context.request.put('/events/'+res2.body.id+'/register/'+t.context.user.id);
    t.is(res.status, 401);

    let res3 = await t.context.request.get('/events/'+res2.body.id);
    t.is(res3.status, 200);
    t.is(res3.body.registered.length, 0);
})

test.todo('Store event (not authorized)');
test.todo('Update event (not aurthorized)');
test.todo('Delete event (not authorized)');
test.todo('Add user to event (not authorized)');
test.todo('Add user to event (event is full)');
test.todo('Remove user from event (not authorized)');