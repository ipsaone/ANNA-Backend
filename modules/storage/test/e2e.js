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
})

test('Upload file', async t => {
    let res = await t.context.request.post('/storage/upload')
        .attach('contents', path.join(root, './app.js'))
        .field('isDir', false)
        .field('name', 'test')
        .field('dirId', t.context.folder.id)
        .field('groupId', t.context.group.id)

    t.is(res.status, 200);
    t.is(res.body.name, 'test');
    t.is(res.body.hidden, false);
    t.is(res.body.type, 'text/plain');
    //t.is(res.body.dirId, t.context.folder.id);
});

test('Upload revision', async t => {
    let res1 = await t.context.request.post('/storage/upload')
        .attach('contents', path.join(root, './app.js'))
        .field('isDir', false)
        .field('name', 'test')
        .field('dirId', t.context.folder.id)
        .field('groupId', t.context.group.id)

    let res2 = await t.context.request.put('/storage/upload/'+res1.body.id)
        .field('name', 'testEdited')

    t.is(res2.status, 200);
    t.is(res2.body.name, 'testEdited');
    t.is(res2.body.hidden, false);
   // t.is(res2.body.dirId, t.context.folder.id);

    let res3 = await t.context.request.put('/storage/upload/'+res1.body.id)
        .attach('contents', path.join(root, './package.json'))
    
    t.is(res3.status, 200);
    t.is(res3.body.name, 'testEdited');
    t.is(res3.body.exists, true);
    t.is(res3.body.type,'text/plain');
    t.is(res3.body.hidden, false);
});

test('Create folder', async t => {
    let res = await t.context.request.post('/storage/upload')
        .field('isDir', true)
        .field('name', 'test')
        .field('dirId', t.context.folder.id)
        .field('groupId', t.context.group.id)

    t.is(res.status, 200);
    t.is(res.body.name, 'test')
    t.is(res.body.type, 'folder');
    t.is(res.body.size, -1);
    t.is(res.body.exists, false);
    t.is(res.body.hidden, false);

    console.log(res.body);

})

test('Download file', async t => {
    let res = await t.context.request.post('/storage/upload')
        .attach('contents', path.join(root, './app.js'))
        .field('isDir', false)
        .field('name', 'test')
        .field('dirId', t.context.folder.id)
        .field('groupId', t.context.group.id)
        .field('ownerRead', true)

        t.is(res.status, 200);

    let res2 = await t.context.request.get('/storage/files/'+res.body.id);
    t.is(res2.status, 200);
    t.is(res2.body.length, 1);
    t.is(res2.body[0].name, 'test');
    t.is(res2.body[0].exists, true);
    t.is(res2.body[0].hidden, false);

    let res3 = await t.context.request.get('/storage/files/'+res.body.id+"?download=true");
    t.is(res3.status, 200);
    t.true(res3.body instanceof Buffer);
});