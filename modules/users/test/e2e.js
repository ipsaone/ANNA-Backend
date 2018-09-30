'use strict'

process.env.TEST = true;

const test = require('ava');

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');

const supertest = require('supertest');

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
    })

    let res = await request.post('/auth/login').send({
        username: 'login_test',
        password: 'password_test'
    })

    t.is(res.status, 200)
})

test('All', async t => {
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

test('Single', async t => {
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