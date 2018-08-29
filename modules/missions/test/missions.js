'use strict';

process.env.TEST = true;

const test = require('ava');

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');
const chance = require('chance').Chance();


const fs = require('fs');


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
    });
    let res = await request.post('/auth/login').send({
        username: 'login_test',
        password: 'password_test'
    });
    t.is(res.status, 200);

    t.context.group = await db.Group.create({
        name: "root"
    });

    
});

test('Create mission (root)', async (t) => {
    await t.context.user.addGroup(t.context.group.id);
    let res = await t.context.request.post('/missions')
        .send({
            name: "test", 
            markdown: "#TEST",
            budgetAssigned: 100,
            budgetUsed: 40,
            groupId: t.context.user.id,
            leaderId: t.context.group.id
        });

    t.is(res.status, 200);
    t.is(res.body.name, 'test');
});

test('Create mission (not root)', async (t) => {
    let res = await t.context.request.post('/missions')
        .send({
            name: "test", 
            markdown: "#TEST",
            budgetAssigned: 100,
            budgetUsed: 40,
            groupId: t.context.user.id,
            leaderId: t.context.group.id
        });

    t.is(res.status, 401);
})

test.skip('Edit mission', async t => {
    t.pass();
})

test.skip('Delete mission', async t => {
    t.pass();
})

