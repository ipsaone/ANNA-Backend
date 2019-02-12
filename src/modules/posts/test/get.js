'use strict'

process.env.TEST = true;

const test = require('ava');

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');

const supertest = require('supertest');

test.beforeEach(async t => {
    const loadApp = require(path.join(root, 'src', './app'));
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


test('All', async t => {
    await t.context.db.Post.create({
        title: 'TEST_POST_1',
        markdown: '#TEST',
        authorId: t.context.user.id,
    })

    await t.context.db.Post.create({
        title: 'TEST_POST_2',
        markdown: '#TEST',
        authorId: t.context.user.id,
        published: true
    })

    let res1 = await t.context.request.get('/posts');

    t.is(res1.status, 200);
    t.is(res1.body.length, 1); // I am not an author, I should see only published ones !

    let group = await t.context.db.Group.create({
        name: 'authors'
    });
    await t.context.user.addGroup(group.id);

    let res2 = await t.context.request.get('/posts');

    t.is(res2.status, 200);
    t.is(res2.body.length, 2); // I am an author, I should see all posts
});

test('Published', async t => {
    await t.context.db.Post.create({
        title: 'TEST_POST_1',
        markdown: '#TEST',
        authorId: t.context.user.id,
        published: true
    })
    let group = await t.context.db.Group.create({
        name: 'authors'
    });
    await t.context.user.addGroup(group.id);
    
    let res = await t.context.request.get('/posts?published=true');

    t.is(res.status, 200);
    t.true(res.body[0].published)
});


test('Drafted', async t => {
    await t.context.db.Post.create({
        title: 'TEST_POST_1',
        markdown: '#TEST',
        authorId: t.context.user.id,
        published: false
    })
    let group = await t.context.db.Group.create({
        name: 'authors'
    });
    await t.context.user.addGroup(group.id);

    let res = await t.context.request.get('/posts?published=false');

    t.is(res.status, 200)

    t.is(res.body.length, 1)

    t.false(res.body[0].published);
    t.falsy(res.body[0].publishedAt)

});

test('Single', async t => {
    let post = await t.context.db.Post.create({
        title: 'TEST_POST_1',
        markdown: '#TEST',
        authorId: t.context.user.id,
        published: true
    })

    let res = await t.context.request.get('/posts/'+post.id)
            
    t.is(res.status, 200)

    t.is(res.body.id, 1);
    t.truthy(res.body.author);

});
