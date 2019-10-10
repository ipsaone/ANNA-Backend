'use strict';

process.env.TEST = true;

const test = require('ava');

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');
const chance = require('chance').Chance();


const fs = require('fs');

test.beforeEach(async t => {
    const loadApp = require(path.join(root, 'src', './app'));
    let {app, modules} = loadApp({test: true, noLog: true, testfile: __filename});
    const request = require('supertest').agent(app);

    const db = await modules.syncDB();

    t.context.app = app;
    t.context.db = db;
    t.context.request = request;

    /* Create and auth first user */
    t.context.user = await db.User.create({
        username: 'login_test',
        password: 'password_test',
        email: 'test@test.com'
    })
    let res = await request.post('/auth/login').send({
        username: 'login_test',
        password: 'password_test'
    })
    t.is(res.status, 200);

    /* Create first group and add user */
    t.context.group = await db.Group.create({
        name: "root"
    });
    await t.context.user.addGroup(t.context.group.id);

    /* Create first folder and its rights */
    t.context.folder = await t.context.db.File.create({
        isDir: true,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now())
    });
    await t.context.db.Right.create({
        groupWrite: true,
        groupRead: true,
        ownerWrite: true,
        ownerRead: true,
        allWrite: true,
        allRead: true
    })
    await t.context.db.Data.create({
        name: 'root',
        size: 0,
        type: '',
        fileId: 1,
        dirId: 1,
        ownerId: 1,
        groupId: 1,
        rightsId: 1,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
        creatorId: 1,
    });
});

test.todo('List files (base folder)');
test.todo('List files (other folder)');
test.todo('List files (scoped)');