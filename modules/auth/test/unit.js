'use strict';

process.env.TEST = true;

const test = require('ava');

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

test('Login', async (t) => {

    const repo = require('../login/repository');

    const accepted = await repo.login(t.context.db, 'login_test', 'password_test');
    t.truthy(accepted);

    const badPassword = await repo.login(t.context.db, 'login_test', 'some_password');
    t.falsy(badPassword);

    const badUser = await repo.login(t.context.db, 'loginTestUser', 'password_test');
    t.falsy(badUser);
});
