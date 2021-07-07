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

    t.context.group = await db.Group.create({
        name: "root",
        id: 1
    });

    t.context.group2 = await db.Group.create({
        name: "default",
        id: 4
    });

    t.context.root = await db.User.create({
        username: 'root',
        password: 'root',
        id: 1,
        email: 'root@root.com'
    });
    await t.context.root.addGroup(t.context.group.id);
    await t.context.root.addGroup(t.context.group2.id)

    t.context.user = await db.User.create({
        username: 'login_test',
        password: 'password_test',
        email: 'test@test.com'
    })

    t.context.user.addGroup(t.context.group2.id);

    t.context.user2 = await db.User.create({
        username: 'login_test2',
        password: 'password_test2',
        email: 'test2@test.com'
    })

    t.context.user2.addGroup(t.context.group2.id);


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

    let res = await request.post('/auth/login').send({
        username: 'login_test',
        password: 'password_test'
    })

    t.is(res.status, 200)
})

test('Get all or single', async t => {
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
    await user1.addGroup(t.context.group2.id);
    await user2.addGroup(t.context.group2.id);


    let res = await t.context.request.get('/users')

    t.is(res.status, 200);
    t.is(res.body.length, 5); // The 3rd and 4th ones is created in beforeEach()

    let res8 = await t.context.request.get('/users/'+user1.id)
    t.is(res8.status, 200);

    let res2 = await t.context.request.get('/users/-3')
    t.is(res2.status, 404);

    let res3 = await t.context.request.get('/users/abc')
    t.is(res3.status, 404)

});

test('Add, edit and remove user', async t => {
    await t.context.user.addGroup(t.context.group);
    let res = await t.context.request.post('/users')
        .send({
            username: 'someUser',
            password: 'somePassword',
            email: 'someEmail@mail.com'
        });
    t.is(res.status, 201);
    t.truthy(res.body.id);

    let res3 = await t.context.request.get('/users');
    t.is(res3.status, 200);
    t.is(res3.body.length, 4);

    let res5 = await t.context.request.put('/users/'+res.body.id)
        .send({
            username: 'testEdited'
        });
    t.is(res5.status, 200);
    t.truthy(res5.body.id)

    let res6 = await t.context.request.get('/users/'+res.body.id);
    t.is(res6.status, 200);
    t.is(res6.body.username, "testEdited");
    t.is(res6.body.groups.map(g => g.name).includes("default"), true);


    let res2 = await t.context.request.delete('/users/'+res.body.id);
    t.is(res2.status, 204);

    let res4 = await t.context.request.get('/users');
    t.is(res4.status, 200);
    t.is(res4.body.length, 3);
});

test('LeaderMissions', async t => {
    await t.context.user.addGroup(t.context.group);
    let res = await t.context.request.post('/users')
        .send({
            username: 'someUser',
            password: 'somePassword',
            email: 'someEmail@mail.com'
        });
    t.is(res.status, 201);
    t.truthy(res.body.id);

    let res2 = await t.context.request.post('/missions')
        .send({
            name: "test",
            markdown: "# TEST",
            budgetAssigned: 100,
            budgetUsed: 40,
            groupId: t.context.group.id,
            leaderId: res.body.id
        });

    t.is(res2.status, 200);

    let res3 = await t.context.request.get('/users/'+res.body.id);
    t.is(res3.status, 200);
    t.is(res3.body.leaderMissions.length, 1);

});

test('Add, list and remove another user\'s groups', async t => {
    let user1 = await t.context.db.User.create({
        username: 'someUser',
        password: 'somePassword',
        email: 'someEmail@mail.com'
    })
    user1.addGroup(t.context.group2.id);

    let group = await t.context.db.Group.create({
        name: "test"
    });

    let res0 = await t.context.request.get('/users/'+user1.id+'/groups');
    t.is(res0.status, 200);
    t.is(res0.body.length, 1);
    t.is(res0.body[0].name, "default")

    let res2 = await t.context.request.put('/users/'+user1.id+'/group/'+group.id);
    t.is(res2.status, 401); // We can't insert someone in some other group

    await t.context.user.addGroup(t.context.group.id); // become root

    let res5 = await t.context.request.put('/users/'+user1.id+'/group/'+group.id);
    t.is(res5.status, 204); 

    let res1 = await t.context.request.get('/users/'+user1.id+'/groups');
    t.is(res1.status, 200);
    t.is(res1.body.length, 2);
    
    let res3 = await t.context.request.delete('/users/'+user1.id+'/group/'+group.id);
    t.is(res3.status, 204);

    let res4 = await t.context.request.get('/users/'+user1.id+'/groups');
    t.is(res4.status, 200);
    t.is(res4.body.length, 1);

});

test('Root cannot remove itself from default group', async t => {
    // https://trello.com/c/NAe9H4PI

    let res = await t.context.request.delete(
        '/users/'+t.context.user.id
        +'/group/'+t.context.group2.id);
    t.is(res.status, 401);

})

test('Upload profile picture', async t => {
    { // FIRST UPLOAD, WILL CREATE THE FOLDERS AND SAVE FILE ID FOR USER
        let res = await t.context.request.put('/users/'+t.context.user.id)
            .attach('profilePicture', path.join(__dirname, 'profilePic.jpg'));
        
        t.is(res.status, 200);
    }

    { // SECOND UPLOAD, WILL USE PREVIOUS FILE ID
        let res = await t.context.request.put('/users/'+t.context.user.id)
            .attach('profilePicture', path.join(__dirname, 'profilePic2.jpg'));
        
        t.is(res.status, 200);
    }

    { // UPLOAD WITH ANOTHER USER, WILL UPLOAD NEW IN EXISTING FOLDERS
        let res = await t.context.request.get('/auth/logout');
        t.is(res.status, 200);

        let res2 = await t.context.request.post('/auth/login').send({
            username: 'login_test2',
            password: 'password_test2'
        })
        t.is(res2.status, 200)

        let res3 = await t.context.request.put('/users/'+t.context.user2.id)
            .attach('profilePicture', path.join(__dirname, 'profilePic.jpg'));
        
        t.is(res3.status, 200);
    }
});