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
        name: "root"
    });

    t.context.defaultGroup = await db.Group.create({
        name: "default"
    });


    t.context.user = await db.User.create({
        username: 'login_test',
        password: 'password_test',
        email: 'test@test.com'
    })

    t.context.user.addGroup(t.context.defaultGroup.id);

    let res = await request.post('/auth/login').send({
        username: 'login_test',
        password: 'password_test'
    })

    t.is(res.status, 200)
});

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
    user.addGroup(t.context.defaultGroup.id);

    let res = await t.context.request.get('/users/'+user.id)
    t.is(res.status, 200);

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
    t.is(res3.body.length, 2);

    let res5 = await t.context.request.put('/users/'+res.body.id)
        .send({
            username: 'testEdited'
        });
    t.is(res5.status, 200);
    t.truthy(res5.body.id)

    let res6 = await t.context.request.get('/users/'+res.body.id);
    t.is(res6.status, 200);
    t.is(res6.body.username, "testEdited");


    let res2 = await t.context.request.delete('/users/'+res.body.id);
    t.is(res2.status, 204);

    let res4 = await t.context.request.get('/users');
    t.is(res4.status, 200);
    t.is(res4.body.length, 1);
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


test('Get user posts', async t => {
    let res = await t.context.request.get('/users/'+t.context.user.id+'/posts');
    t.is(res.status, 200);
    t.is(res.body.length, 0);

    await t.context.db.Post.create({
        title: 'TEST_POST_1',
        markdown: '#TEST',
        authorId: t.context.user.id,


    });

    await t.context.db.Post.create({
        title: 'TEST_POST_11',
        markdown: '#TEST',
        authorId: t.context.user.id,
        published: true       

    });

    await t.context.db.Post.create({
        title : 'TEST_POST_2',
        markdown : '#TEST',
        authorId: t.context.user.id,
        published: false


    })

    {
        let res2 = await t.context.request.get('/users/'+t.context.user.id+'/posts');
        t.is(res2.status, 200);
        t.is(res2.body.length, 3);
        t.is(res2.body[0].title, 'TEST_POST_1');
    }

    {
        let res2 = await t.context.request.get('/users/'+t.context.user.id+'/posts?published=true');
        t.is(res2.status, 200);
        t.is(res2.body.length, 1);
        t.is(res2.body[0].title, 'TEST_POST_11');
    }

    {
        let res2 = await t.context.request.get('/users/'+t.context.user.id+'/posts?published=false');
        t.is(res2.status, 200);
        t.is(res2.body.length, 2);
        t.is(res2.body[0].title, 'TEST_POST_1');
        t.is(res2.body[1].title, 'TEST_POST_2');
    }


});




test('List user groups', async t => {
    let res = await t.context.request.get('/users/'+t.context.user.id+'/groups');
    t.is(res.status, 200);
    t.is(res.body.length, 1);

    await t.context.user.addGroup(t.context.group);

    let res2 = await t.context.request.get('/users/'+t.context.user.id+'/groups');
    t.is(res2.status, 200);
    t.is(res2.body.length, 2);
    t.is(res2.body[0].name, 'default');
    t.is(res2.body[1].name, 'root');


});


test('Add user to group', async t => {
    await t.context.user.addGroup(t.context.group);

    const group2 = await t.context.db.Group.create({
        name: "test"
    });

    let res = await t.context.request.put('/users/'+t.context.user.id+'/group/'+group2.id);
    t.is(res.status, 204);

    let res2 = await t.context.request.get('/users/'+t.context.user.id+'/groups');
    t.is(res2.status, 200);
    t.is(res2.body.length, 3);




});


test('Remove user from group', async t => {
    await t.context.user.addGroup(t.context.group);

    let res = await t.context.request.delete('/users/'+t.context.user.id+'/group/'+t.context.group.id);
    t.is(res.status, 204);

    let res2 = await t.context.request.get('/users/'+t.context.user.id+'/groups');
    t.is(res2.status, 200);
    t.is(res2.body.length, 1);
});


test('No password when fetching user in database', async t => {
    let curUser = await t.context.db.User.findByPk(t.context.user.id);
    t.is(!curUser.password, true);
});

test.todo('Default group');