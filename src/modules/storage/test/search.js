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

    t.context.right = await t.context.db.Right.create({
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

test('Find data', async t => {
    // UPLOAD FILE
    let res = await t.context.request.post('/storage/upload')
        .attach('contents', path.join(root, 'src', './app.js'))
        .field('isDir', false)
        .field('name', 'test')
        .field('dirId', t.context.folder.id)
        .field('groupId', t.context.group.id)
        .field('serialNbr', 'abc-def');
    t.is(res.status, 200);
    t.is(res.body.name, 'test');

    // FIND FILE BY NAME
    let res2 = await t.context.request.get('/storage/files/search')
        .send({
            keyword: 'test',
            upperFolder: t.context.folder.id,
            include: ['name']
        })
    t.is(res2.body.length, 1);
    t.is(res2.body[0].name, 'test');

    // FIND FILE BY SERIAL NUMBER
    let res3 = await t.context.request.get('/storage/files/search')
        .send({
            keyword: 'abc-def',
            upperFolder: t.context.folder.id,
            include: ['serialNbr']
        })

    t.is(res3.body.length, 1);

    // REMOVE READ RIGHTS
    t.context.right.ownerRead = false;
    t.context.right.groupRead = false;
    t.context.right.allRead = false;
    t.context.right.save();

    // CONFIRM YOU CAN'T READ
    let res4 = await t.context.request.get('/storage/files/search')
        .send({
            keyword: 'test',
            upperFolder: t.context.folder.id,
            include: ['name']
        })

    t.is(res4.body.length, 0);
})

test.todo('Find data (by name, older)');
test.todo('Find data (by serialNbr, older)');
