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
    let {app, modules} = loadApp({test: true, noLog: true});
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
        updatedAt: new Date(Date.now())
    });
});

test('Find data (by name, latest)', async t => {
    let res = await t.context.request.post('/storage/upload')
        .attach('contents', path.join(root, 'src', './app.js'))
        .field('isDir', false)
        .field('name', 'test')
        .field('dirId', t.context.folder.id)
        .field('groupId', t.context.group.id)

    t.is(res.status, 200);
    t.is(res.body.name, 'test');

    let res2 = await t.context.request.get('/storage/files/search')
        .send({
            keyword: 'test',
            upperFolder: t.context.folder.id,
            include: ['name']
        })

    t.is(res2.body.length, 1);
})
test.todo('Find data (by name, older)');
test('Find data (by serialNbr, latest)', async t => {
    let res = await t.context.request.post('/storage/upload')
        .attach('contents', path.join(root, 'src', './app.js'))
        .field('isDir', false)
        .field('name', 'test')
        .field('dirId', t.context.folder.id)
        .field('groupId', t.context.group.id)
        .field('serialNbr', 'abc-def');

    t.is(res.status, 200);
    t.is(res.body.name, 'test');

    let res2 = await t.context.request.get('/storage/files/search')
        .send({
            keyword: 'abc-def',
            upperFolder: t.context.folder.id,
            include: ['serialNbr']
        })

    t.is(res2.body.length, 1);
});
test.todo('Find data (by serialNbr, older');
test.todo('Delete file');
test('Delete folder', async t => {
    let res = await t.context.request.post('/storage/upload')
        .field('isDir', true)
        .field('name', 'test')
        .field('dirId', t.context.folder.id)
        .field('groupId', t.context.group.id)
        .field('ownerRead', true)
        .field('groupRead', true)
        .field('allRead', true)

    t.is(res.status, 200);

    let res88 = await t.context.request.get('/storage/files/list/'+t.context.folder.id);
    t.is(res88.body.children.length, 1);


    let res2 = await t.context.request.delete('/storage/files/'+res.body.id);
    t.is(res2.status, 204);

    let res_2 = await t.context.request.get('/storage/files/list/'+t.context.folder.id);
    t.is(res_2.body.children.length, 0)
});