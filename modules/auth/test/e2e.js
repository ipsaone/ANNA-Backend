'use strict';

process.env.TEST = true;

const test = require('ava');
const winston = require('winston');
const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');

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
})

test('Login', async t => {
    let SuccessRes = await t.context.request.post('/auth/login')
        .send({
            username: 'login_test',
            password: 'password_test'
        })

    t.is(SuccessRes.status, 200);

    let badPasswordRes = await t.context.request.post('/auth/login')
        .send({
            username: 'login_test',
            password: 'qlmdkgsfk'
        })

    t.is(badPasswordRes.status, 401)

    let badUserRes = await t.context.request.post('/auth/login')
        .send({
            username: 'login_test8',
            password: 'password_test'
        })

    t.true(badUserRes.status == 401)
});



test('Logout', async t => {
    let res1 = await t.context.request.get('/auth/logout')
    t.is(res1.status, 401);

    let SuccessRes = await t.context.request.post('/auth/login')
        .send({
            username: 'login_test',
            password: 'password_test'
        })

    t.is(SuccessRes.status, 200);

    let res2 = await t.context.request.get('/auth/logout')
    t.is(res2.status, 200);
});

test('Check', async t => {
    let res = await t.context.request.get('/auth/check')
    t.is(res.status, 200);
});