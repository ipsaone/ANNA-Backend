'use strict'

process.env.TEST = true;

const test = require('ava');

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');

const supertest = require('supertest');

test.beforeEach(async t => {
    const loadApp = require(path.join(root, 'src', './app'));
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

    t.context.group = await db.Group.create({ name: "default" });
    await t.context.user.addGroup(t.context.group.id);
    

    let res = await request.post('/auth/login').send({
        username: 'login_test',
        password: 'password_test'
    })

    t.is(res.status, 200)
})

test('add, edit and delete group (root)', async t => {
    const group2 = await t.context.db.Group.create({ name: 'root' });
    await t.context.user.addGroup(group2.id);

    let res = await t.context.request.post('/groups/')
        .send({
            name: 'test'
        });

    t.is(res.status, 201);
    t.is(res.body.name, 'test');

    let res3 = await t.context.request.get('/groups');
    t.is(res3.status, 200);
    t.is(res3.body.length, 3); // root, default, test

    let res5 = await t.context.request.put('/groups/'+res.body.id)
        .send({
            name: 'testEdited'
        });
    t.is(res5.status, 200);
    t.is(res5.body.name, "testedited") // names are automatically lower-cased !
    
    let res6 = await t.context.request.get('/groups/'+res.body.id);
    t.is(res6.status, 200);
    t.is(res6.body.name, "testedited") // names are automatically lower-cased !


    let res2 = await t.context.request.delete('/groups/'+res.body.id);
    t.is(res2.status, 204);

    let res4 = await t.context.request.get('/groups');
    t.is(res4.status, 200);
    t.is(res4.body.length, 2);
});

test('Delete default group', async t => {
    const group2 = await t.context.db.Group.create({ name: 'root' });
    await t.context.user.addGroup(group2.id);
    const group3 = await t.context.db.Group.create({ name: 'organizers' });
    const group4 = await t.context.db.Group.create({ name: 'authors' });

    let res0 = await t.context.request.delete('/groups/'+t.context.group.id);
    t.is(res0.status, 400); // because there are still users inside of it, it throws Foreign key constraint error

    let res1 = await t.context.request.delete('/groups/'+group2.id);
    t.is(res1.status, 401);

    let res2 = await t.context.request.delete('/groups/'+group3.id);
    console.error(res2.body);
    t.is(res2.status, 401);

    let res3 = await t.context.request.delete('/groups/'+group4.id);
    t.is(res3.status, 401);


});