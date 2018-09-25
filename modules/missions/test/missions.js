'use strict'

process.env.TEST = true;

import test, { beforeEach, skip } from 'ava';

import findRoot from 'find-root';
const root = findRoot(__dirname);
import { join } from 'path';
const chance = require('chance').Chance();


import fs from 'fs';


beforeEach(async t => {
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
            groupId: t.context.user.id,
            leaderId: t.context.group.id
        });

    t.is(res.status, 401);
})


test.skip('Edit mission', async t => {
    t.pass();
});

test('Delete mission', async t => {
    await t.context.user.addGroup(t.context.group.id);
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

    let res2 = await t.context.request.delete('/missions/'+res.body.id);
    t.is(res2.status, 204);

    let res3 = await t.context.db.Mission.findAll();
    t.is(res3.length, 0);
});