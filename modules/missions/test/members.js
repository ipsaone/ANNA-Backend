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
    let res = await request.post('/auth/login').send({
        username: 'login_test',
        password: 'password_test'
    });
    t.is(res.status, 200);

    t.context.group = await db.Group.create({
        name: "root"
    });

    await t.context.user.addGroup(t.context.group.id);
    let res2 = await t.context.request.post('/missions')
        .send({
            name: "test", 
            markdown: "# TEST",
            budgetAssigned: 100,
            budgetUsed: 40,
            groupId: t.context.user.id,
            leaderId: t.context.group.id
        });
    
    t.is(res2.status, 200);
    t.context.missionId = res2.body.id;
    
});

test('Add self to mission', async t => {
    let res = await t.context.request.put('/missions/'+t.context.missionId+'/members/1');
    t.is(res.status, 200);

    let res2 = await t.context.request.get('/users/'+t.context.user.id);
    t.is(res2.body.participatingMissions.length, 1);
    t.is(res2.body.participatingMissions[0].name, 'test');
});

test('Remove self from mission', async t => {
    let res = await t.context.request.put('/missions/'+t.context.missionId+'/members/1');
    t.is(res.status, 200);

    let res2 = await t.context.request.get('/users/'+t.context.user.id);
    t.is(res2.body.participatingMissions.length, 1);
    t.is(res2.body.participatingMissions[0].name, 'test');

    let res3 = await t.context.request.delete('/missions/'+t.context.missionId+'/members/1');
    t.is(res3.status, 200);

    let res4 = await t.context.request.get('/users/'+t.context.user.id);
    t.is(res4.body.participatingMissions.length, 0);
});
