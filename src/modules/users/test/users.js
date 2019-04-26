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

    t.context.group = await db.Group.create({
        name: "root"
    });


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
})

test('Get all', async t => {
    let user1 = await t.context.db.User.create({
        username: 'someUser',
        password: 'somePassword',
        email: 'someEmail@mail.com'
    })
    let user2 = await t.context.db.User.create({
        username: 'someUser2222',
        password: 'somePassword56',
        email: 'someEmail212@mail.com'
    })

    let res = await t.context.request.get('/users')

    t.is(res.status, 200);
    t.is(res.body.length, 3); // The 3rd one is created in beforeEach()

});

test('Get single', async t => {
    let user = await t.context.db.User.create({
        username: 'someUser',
        password: 'somePassword',
        email: 'someEmail@mail.com'
    })

    let res = await t.context.request.get('/users/'+user.id)
    t.is(res.status, 200);

    let res2 = await t.context.request.get('/users/-3')
    t.is(res2.status, 404);

    let res3 = await t.context.request.get('/users/abc')
    t.is(res3.status, 404)


});

test('Add, edit and remove user', async t => {
    await t.context.user.addGroup(t.context.group);
    let res = await t.context.request.post('/users')
        .send({
            username: 'someUser',
            password: 'somePassword',
            email: 'someEmail@mail.com'
        });
    t.is(res.status, 201);
    t.is(res.body.username, 'someUser');

    let res3 = await t.context.request.get('/users');
    t.is(res3.status, 200);
    t.is(res3.body.length, 2);

    let res5 = await t.context.request.put('/users/'+res.body.id)
        .send({
            username: 'testEdited'
        });
    t.is(res5.status, 200);
    t.is(res5.body.username, "testEdited")

    let res6 = await t.context.request.get('/users/'+res.body.id);
    t.is(res6.status, 200);
    t.is(res6.body.username, "testEdited");


    let res2 = await t.context.request.delete('/users/'+res.body.id);
    t.is(res2.status, 204);

    let res4 = await t.context.request.get('/users');
    t.is(res4.status, 200);
    t.is(res4.body.length, 1);
});

test('LeaderMissions', async t => {
    await t.context.user.addGroup(t.context.group);
    let res = await t.context.request.post('/users')
        .send({
            username: 'someUser',
            password: 'somePassword',
            email: 'someEmail@mail.com'
        });
    t.is(res.status, 201);
    t.is(res.body.username, 'someUser');

    let res2 = await t.context.request.post('/missions')
        .send({
            name: "test",
            markdown: "# TEST",
            budgetAssigned: 100,
            budgetUsed: 40,
            groupId: t.context.group.id,
            leaderId: res.body.id
        });

    t.is(res2.status, 200);

    let res3 = await t.context.request.get('/users/'+res.body.id);
    t.is(res3.status, 200);
    t.is(res3.body.leaderMissions.length, 1);

});

test.todo('Get user posts');
test.todo('User policies');