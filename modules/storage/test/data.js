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
    })

    let res = await request.post('/auth/login').send({
        username: 'login_test',
        password: 'password_test'
    })

    t.is(res.status, 200)

    t.context.dir = await db.File.create({
        isDir: true
    })
    t.context.group = await db.Group.create({
        name: 'test'
    })

    t.context.right = await db.Right.create({
        ownerWrite: true,
        ownerRead: true,
        groupWrite: true,
        groupRead: true,
        allWrite: true,
        allRead: true
    })
    t.context.file = await db.File.create({
        isDir: false
    });

})

test('Get URL', async (t) => {
    let data = await t.context.db.Data.create({
        name: 'bla',
        exists: false,
        fileId: t.context.file.id,
        dirId: t.context.dir.id,
        ownerId: t.context.user.id,
        groupId: t.context.group.id,
        rightsId: t.context.right.id
    })

    let url = await data.getUrl();

    t.is(typeof(url), 'string');


});

test('Get path', async t => {
    let data = await t.context.db.Data.create({
        name: 'bla',
        exists: false,
        fileId: t.context.file.id,
        dirId: t.context.dir.id,
        ownerId: t.context.user.id,
        groupId: t.context.group.id,
        rightsId: t.context.right.id
    })

    let path = await data.getPath();

    t.is(typeof(path), 'string');
})

test('Get rights', async t => {
    let data = await t.context.db.Data.create({
        name: 'bla',
        exists: false,
        fileId: t.context.file.id,
        dirId: t.context.dir.id,
        ownerId: t.context.user.id,
        groupId: t.context.group.id,
        rightsId: t.context.right.id
    })

    let right = await data.getRights(t.context.db);

    t.deepEqual(right.toJSON(), t.context.right.toJSON());
});
