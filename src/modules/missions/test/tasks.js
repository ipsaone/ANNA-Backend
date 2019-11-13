'use strict'

process.env.TEST = true;

const test = require('ava');

const findRoot =  require('find-root');
const root = findRoot(__dirname);
const {join} = require('path');
const chance = require('chance').Chance();


const fs = require('fs');


test.beforeEach(async t => {
    const loadApp = require(join(root, 'src', './app'));
    let {app, modules} = loadApp({test: true, noLog: true, testfile: __filename});
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
        username: 'login_test_2',
        password: 'password_test_2',
        email: 'test_2@test.com'
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
        name: "default"
    })
    t.context.user.addGroup(t.context.group2.id);
    
});


test('Add, show, list, edit and remove task from mission (root, not leader)', async t => {
    await t.context.user.addGroup(t.context.group.id);
    let res8 = await t.context.request.post('/missions')
        .send({
            name: "test", 
            markdown: "# TEST",
            budgetAssigned: 100,
            budgetUsed: 40,
            groupId: t.context.group.id,
            leaderId: t.context.user2.id 
        });

    t.is(res8.status, 200);  
    t.context.mission = res8.body;

    let res = await t.context.request.post('/missions/'+t.context.mission.id+'/tasks')
        .send({
            done: false,
            name: 'test'
        });
    t.is(res.status, 200);

    let res2 = await t.context.request.get('/missions/'+t.context.mission.id+'/tasks');
    t.is(res2.status, 200);
    t.is(res2.body.length, 1);
    t.is(res2.body[0].name, 'test');

    let res0 = await t.context.request.get('/missions/'+t.context.mission.id+'/task/'+res.body.id);
    t.is(res0.status, 200);
    t.is(res0.body.name, 'test');

    let res6 = await t.context.request.put('/missions/'+t.context.mission.id+'/task/'+res.body.id)
        .send({
            name: 'testEdit'
        });
    t.is(res6.status, 200);
   
    let res5 = await t.context.request.get('/missions/'+t.context.mission.id+'/tasks');
    t.is(res5.status, 200);
    t.is(res5.body.length, 1);
    t.is(res5.body[0].name, 'testEdit');

    let res3 = await t.context.request.delete('/missions/'+t.context.mission.id+'/task/'+res.body.id);
    t.is(res3.status, 204);

    let res4 = await t.context.request.get('/missions/'+t.context.mission.id+'/tasks');
    t.is(res4.status, 200);
    t.is(res4.body.length, 0);
});

test('Add, show, list, edit and remove task from mission (leader, not root)', async t => {
    await t.context.user.addGroup(t.context.group.id);
    let res8 = await t.context.request.post('/missions')
        .send({
            name: "test", 
            markdown: "# TEST",
            budgetAssigned: 100,
            budgetUsed: 40,
            groupId: t.context.group.id,
            leaderId: t.context.user.id 
        });

    t.is(res8.status, 200);  
    t.context.mission = res8.body;

    let def_group = await t.context.db.Group.create({
        name: "default"
    })
    await t.context.user.setGroups(def_group.id);

    let res = await t.context.request.post('/missions/'+t.context.mission.id+'/tasks')
        .send({
            done: false,
            name: 'test'
        });
    t.is(res.status, 200);

    let res2 = await t.context.request.get('/missions/'+t.context.mission.id+'/tasks');
    t.is(res2.status, 200);
    t.is(res2.body.length, 1);
    t.is(res2.body[0].name, 'test');

    let res0 = await t.context.request.get('/missions/'+t.context.mission.id+'/task/'+res.body.id);
    t.is(res0.status, 200);
    t.is(res0.body.name, 'test');

    let res6 = await t.context.request.put('/missions/'+t.context.mission.id+'/task/'+res.body.id)
        .send({
            name: 'testEdit'
        });
    t.is(res6.status, 200);
   
    let res5 = await t.context.request.get('/missions/'+t.context.mission.id+'/tasks');
    t.is(res5.status, 200);
    t.is(res5.body.length, 1);
    t.is(res5.body[0].name, 'testEdit');

    let res3 = await t.context.request.delete('/missions/'+t.context.mission.id+'/task/'+res.body.id);
    t.is(res3.status, 204);

    let res4 = await t.context.request.get('/missions/'+t.context.mission.id+'/tasks');
    t.is(res4.status, 200);
    t.is(res4.body.length, 0);
});