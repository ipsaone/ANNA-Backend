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
})

test('File type/size', async (t) => {
    
    const repo = require('../repository');
    
    //let sizeP = repo.computeSize(__filename);
    let typeP = repo.computeType(__filename);
    
    //let size = await sizeP;
    //t.is(size, fs.statSync(__filename).size);

    let type = await typeP;
    t.is(type, 'text/plain');
    
});


async function filePermissionMacro(t, input) {

    const loadApp = require(path.join(root, './app'));
    let {app, modules} = loadApp({test: true, noLog: true});
    const request = require('supertest').agent(app);

    const db = await modules.syncDB();


    let user = await db.User.create({
        username: 'login_test',
        password: 'password_test',
        email: 'test@test.com'
    })

    let res = await request.post('/auth/login').send({
        username: 'login_test',
        password: 'password_test'
    })

    t.is(res.status, 200);

    const repo = require('../repository');

    let groupP = db.Group.create({
        name: 'test'
    });
    let rightP = db.Right.create(input);
    let fileP = db.File.create({
        isDir: false
    });

    let group = await groupP;
    let right = await rightP;
    let file = await fileP;
    let dataP = db.Data.create({
        name: 'Test',
        exists: false,
        dirId: 1,
        fileId: file.id,
        ownerId: user.id,
        rightsId: right.id,
        groupId: group.id,
        hidden: false,
    });

    let groupUser = await db.User.create({
        username: 'Test2',
        email: 'someEmail@gmail.com',
        password: 'testPassword'
    })
    let groupAddUserP = group.addUser(groupUser.id);

    let otherUserP = db.User.create({
        username: 'Test3',
        email: 'someOtherEmail@gmail.com',
        password: 'testPassword2'
    });

    await dataP;
    let ownerWriteOK = await repo.fileHasWritePermission(db, file.id, user.id);
    let ownerReadOK = await repo.fileHasReadPermission(db, file.id, user.id);
    t.is(ownerWriteOK, input.ownerWrite||input.allWrite);
    t.is(ownerReadOK, input.ownerRead||input.allRead);

    await groupAddUserP;
    let groupWriteOK = await repo.fileHasWritePermission(db, file.id, groupUser.id);
    let groupReadOK = await repo.fileHasReadPermission(db, file.id, groupUser.id); 
    t.is(groupWriteOK, input.groupWrite||input.allWrite);
    t.is(groupReadOK, input.groupRead||input.allRead);   

    let otherUser = await otherUserP;
    let allWriteOK = await repo.fileHasWritePermission(db, file.id, otherUser.id);
    let allReadOK = await repo.fileHasReadPermission(db, file.id, otherUser.id);
    t.is(allWriteOK, input.allWrite);
    t.is(allReadOK, input.allRead);
}

test('File permissions', async t => {
    let iterations = 30;
    let promises = [];
    for(let i = 0; i < iterations; i++) {
        promises.push(
            filePermissionMacro(t, {
                ownerWrite: chance.bool(),
                ownerRead: chance.bool(),
                groupWrite: chance.bool(),
                groupRead: chance.bool(),
                allWrite: chance.bool(),
                allRead: chance.bool()
            })
        ); 
    }

    await Promise.all(promises);
})