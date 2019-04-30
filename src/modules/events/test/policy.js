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
    });

    let res = await request.post('/auth/login').send({
        username: 'login_test',
        password: 'password_test'
    });
    t.is(res.status, 200);

    t.context.group = await db.Group.create({
        name: "root"
    });
    
    t.context.group2 = await db.Group.create({
        name: "root"
    });
});


test('Events addition, list, details, edition and suppression (no group)', async t => {

    let res0 = await t.context.request.post('/events')
        .send({
            name: "test",
            markdown: "# TEST",
            maxRegistered: 10,
            startDate : Date.now().toString(),
            endDate: Date.now().toString()
        })
    t.is(res0.status, 401);

    let res = await t.context.request.post('/events')
        .send({
            name: "test",
            markdown: "# TEST",
            maxRegistered: 10,
            startDate : Date.now().toString(),
            endDate: Date.now().toString()
        })
    t.is(res.status, 401);

    await t.context.user.addGroup(t.context.group.id);
    let res8 = await t.context.request.post('/events')
        .send({
            name: "test",
            markdown: "# TEST",
            maxRegistered: 10,
            startDate : Date.now().toString(),
            endDate: Date.now().toString()
        })

    t.is(res8.status, 201);
    t.is(res8.body.name, 'test');
    await t.context.user.setGroups([]);

    let res2 = await t.context.request.get('/events/'+res8.body.id);
    t.is(res2.status, 200);
    t.is(res2.body.name, 'test');

    let res3 = await t.context.request.put('/events/'+res8.body.id)
        .send({
            name: 'testEdited'
        });
    t.is(res3.status, 401);

    let res4 = await t.context.request.delete('/events/'+res8.body.id);
    t.is(res4.status, 401);
    
    let res5 = await t.context.request.get('/events');
    t.is(res5.status, 200);
    t.is(res5.body.length, 1);

});


test('Events addition, list, details, edition and suppression (organizer)', async t => {
    t.context.user.addGroup(t.context.group2.id);

    let res0 = await t.context.request.post('/events')
        .send({
            name: "test",
            markdown: "# TEST",
            maxRegistered: 10,
            startDate : Date.now().toString(),
            endDate: Date.now().toString()
        })
    t.is(res0.status, 201);

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

    let res4 = await t.context.request.delete('/events/'+res.body.id);
    t.is(res4.status, 204);
    
    let res5 = await t.context.request.get('/events');
    t.is(res5.status, 200);
    t.is(res5.body.length, 1);

});

test.todo('Add user to event (no group)');
test.todo('Remove user from event (no group)');
test.todo('Add user to event (organizer)');
test.todo('Remove user from event (organizer)');