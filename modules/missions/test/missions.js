'use strict'

process.env.TEST = true;

const {test} = require('ava');

const findRoot =  require('find-root');
const root = findRoot(__dirname);
const {join} = require('path');
const chance = require('chance').Chance();


const fs = require('fs');


test.beforeEach(async t => {
    const loadApp = require(join(root, './app'));
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

    t.context.user2 = await db.User.create({
      username: 'login_test2',
      password: 'password_test2',
      email: 'test2@test.com'
    })

    let res = await request.post('/auth/login').send({
        username: 'login_test',
        password: 'password_test'
    });
    t.is(res.status, 200);

    t.context.group = await db.Group.create({
        name: "root"
    });

    t.context.user2 = await db.User.create({
        username: 'login_test8',
        password: 'password_test2',
        email: 'teqfdgsdfgst2@test.com'
    })


});

test('Create mission (root)', async (t) => {
    await t.context.user.addGroup(t.context.group);
    let res = await t.context.request.post('/missions')
        .send({
            name: "test",
            markdown: "# TEST",
            budgetAssigned: 100,
            budgetUsed: 40,
            groupId: t.context.user.id,
            leaderId: t.context.group.id
        });

    t.is(res.status, 200);
    t.is(res.body.name, 'test');
    t.is(res.body.description.startsWith('<h1 id="test">TEST</h1>'), true);
});

test('Create mission (not root)', async (t) => {
    let res = await t.context.request.post('/missions')
        .send({
            name: "test",
            markdown: "# TEST",
            budgetAssigned: 100,
            budgetUsed: 40,
            groupId: t.context.group.id,
            leaderId: t.context.user.id
        });

    t.is(res.status, 401);
});

test('Create mission (no name)', async (t) => {
    await t.context.user.addGroup(t.context.group);
    let res = await t.context.request.post('/missions')
        .send({
            name: "",
            markdown: "# TEST",
            budgetAssigned: 100,
            budgetUsed: 40,
            groupId: t.context.group.id,
            leaderId: t.context.user.id
        });

    t.is(res.status, 400);
});

test('Create mission (blank name)', async (t) => {
    await t.context.user.addGroup(t.context.group);
    let res = await t.context.request.post('/missions')
        .send({
            name: "     ",
            markdown: "# TEST",
            budgetAssigned: 100,
            budgetUsed: 40,
            groupId: t.context.group.id,
            leaderId: t.context.user.id
        });

    t.is(res.status, 400);
});

test('Create mission (no markdown)', async (t) => {
    await t.context.user.addGroup(t.context.group);
    let res = await t.context.request.post('/missions')
        .send({
            name: "name",
            markdown: "",
            budgetAssigned: 100,
            budgetUsed: 40,
            groupId: t.context.group.id,
            leaderId: t.context.user.id
        });

    t.is(res.status, 400);
});

test('Create mission (negative budgetAssigned)', async (t) => {
    await t.context.user.addGroup(t.context.group);
    let res = await t.context.request.post('/missions')
        .send({
            name: "name",
            markdown: "  ",
            budgetAssigned: -3100,
            budgetUsed: 40,
            groupId: t.context.group.id,
            leaderId: t.context.user.id
        });

    t.is(res.status, 401);
});


test('Create mission (negative budgetUsed)', async (t) => {
    await t.context.user.addGroup(t.context.group);
    let res = await t.context.request.post('/missions')
        .send({
            name: "name",
            markdown: "  ",
            budgetAssigned: 3100,
            budgetUsed: -40,
            groupId: t.context.group.id,
            leaderId: t.context.user.id
        });

    t.is(res.status, 401);
});


test('Edit mission', async t => {
    await t.context.user.addGroup(t.context.group);
    let res = await t.context.request.post('/missions')
        .send({
            name: "test",
            markdown: "# TEST",
            budgetAssigned: 100,
            budgetUsed: 40,
            groupId: t.context.group.id,
            leaderId: t.context.user.id
        });

    t.is(res.status, 200);

    let res2 = await t.context.request.put('/missions/'+res.body.id)
        .send({
            name: "testEdited"
        });

    t.is(res2.status, 200);
    t.is(res2.body.name, 'testEdited');
});

test('Edit mission (no name)', async t => {
    await t.context.user.addGroup(t.context.group);
    let res = await t.context.request.post('/missions')
        .send({
            name: "name",
            markdown: "# TEST",
            budgetAssigned: 100,
            budgetUsed: 40,
            groupId: t.context.group.id,
            leaderId: t.context.user.id
        });

    t.is(res.status, 200);

    let res2 = await t.context.request.put('/missions/'+res.body.id)
        .send({
            name: "  "
        });

    t.is(res2.status, 400);
    t.is(res2.body.name, 'testEdited');
});

test('Edit mission (not root & not leader)' , async t => {
    let res = await t.context.request.post('/missions')
        .send({
            name: "test",
            markdown: "# TEST",
            budgetAssigned: 100,
            budgetUsed: 40,
            groupId: t.context.group.id,
            leaderId: t.context.user2.id
        });

    t.is(res.status, 401);

    let res2 = await t.context.request.put('/missions/'+res.body.id)
        .send({
            name: "testEdited"
        });

    t.is(res2.status, 400);
});

test('Edit mission (no markdown)', async t => {
    await t.context.user.addGroup(t.context.group);
    let res = await t.context.request.post('/missions')
        .send({
            name: "test",
            markdown: "# TEST",
            budgetAssigned: 100,
            budgetUsed: 40,
            groupId: t.context.group.id,
            leaderId: t.context.user.id
        });

    t.is(res.status, 200);

    let res2 = await t.context.request.put('/missions/'+res.body.id)
        .send({
            name: "testEdited",
            markdown: " ",
            budgetAssigned: 100,
            budgetUsed: 40,
            groupId: t.context.group.id,
            leaderId: t.context.user.id
        });

    t.is(res2.status, 400);
});


test('Edit mission (negative budgetAssigned)', async t => {
    await t.context.user.addGroup(t.context.group);
    let res = await t.context.request.post('/missions')
        .send({
            name: "test",
            markdown: "# TEST",
            budgetAssigned: 100,
            budgetUsed: 40,
            groupId: t.context.group.id,
            leaderId: t.context.user.id
        });

    t.is(res.status, 200);

    let res2 = await t.context.request.put('/missions/'+res.body.id)
        .send({
            name: "testEdited",
            markdown: "# TEST",
            budgetAssigned: -100,
            budgetUsed: 40,
            groupId: t.context.group.id,
            leaderId: t.context.user.id
        });

    t.is(res2.status, 401);
});

test('Edit mission (negative budgetUsed)', async t => {
    await t.context.user.addGroup(t.context.group);
    let res = await t.context.request.post('/missions')
        .send({
            name: "test",
            markdown: "# TEST",
            budgetAssigned: 100,
            budgetUsed: 40,
            groupId: t.context.group.id,
            leaderId: t.context.user.id
        });

    t.is(res.status, 200);

    let res2 = await t.context.request.put('/missions/'+res.body.id)
        .send({
            name: "testEdited",
            markdown: "# TEST",
            budgetAssigned: 100,
            budgetUsed: -40,
            groupId: t.context.group.id,
            leaderId: t.context.user.id
        });

    t.is(res2.status, 401);
});

test('List missions', async t => {
    await t.context.user.addGroup(t.context.group);
    await t.context.request.post('/missions')
        .send({
            name: "test",
            markdown: "# TEST",
            budgetAssigned: 100,
            budgetUsed: 40,
            groupId: t.context.group.id,
            leaderId: t.context.user.id
        });

    await t.context.request.post('/missions')
        .send({
            name: "test2",
            markdown: "# TEST2",
            budgetAssigned: 100,
            budgetUsed: 40,
            groupId: t.context.group.id,
            leaderId: t.context.user.id
        });

    let res = await t.context.request.get('/missions');
    t.is(res.status, 200);
    t.is(res.body.length, 2);
    t.is(res.body[0].name, 'test');
    t.is(res.body[1].name, 'test2');
});

test('Mission details', async t => {
    await t.context.user.addGroup(t.context.group);
    let res = await t.context.request.post('/missions')
        .send({
            name: "test",
            markdown: "# TEST",
            budgetAssigned: 100,
            budgetUsed: 40,
            groupId: t.context.group.id,
            leaderId: t.context.user.id
        });
    t.is(res.status, 200);

    let res2 = await t.context.request.get('/missions/'+res.body.id);
    t.is(res2.status, 200);
    t.is(res2.body.name, 'test');
});

test('Delete mission', async t => {
    await t.context.user.addGroup(t.context.group);
    let res = await t.context.request.post('/missions')
        .send({
            name: "test",
            markdown: "# TEST",
            budgetAssigned: 100,
            budgetUsed: 40,
            groupId: t.context.group.id,
            leaderId: t.context.user.id
        });

    t.is(res.status, 200);

    let res2 = await t.context.request.delete('/missions/'+res.body.id);
    t.is(res2.status, 204);

    let res3 = await t.context.db.Mission.findAll();
    t.is(res3.length, 0);
});
