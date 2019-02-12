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
});

test('New post', async t => {
    let res1 = await t.context.request.post('/posts')
        .send({
            title: 'Lorem ipsum',
            markdown: '#Lorem ipsum',
            authorId: t.context.user.id,
            published: true
        })
    t.is(res1.status, 401);

    let group = await t.context.db.Group.create({
        name: 'authors'
    });
    await t.context.user.addGroup(group.id);

    let res = await t.context.request.post('/posts')
        .send({
            title: 'Lorem ipsum',
            markdown: 'Lorem ipsum',
            authorId: t.context.user.id,
            published: true
        })
        
    t.is(res.status, 201);

    t.is(res.body.title, 'Lorem ipsum');
    t.is(res.body.markdown, 'Lorem ipsum')
    t.is(res.body.content.replace(/\r?\n?/g, ''), '<p>Lorem ipsum</p>')


    let post = await t.context.db.Post.findByPk(res.body.id);

    t.is(post.id, res.body.id);
    t.is(post.title, 'Lorem ipsum');
    t.is(post.markdown, 'Lorem ipsum');
    t.is(post.content.replace(/\r?\n?/g, ''), '<p>Lorem ipsum</p>');
    t.true(post.published);
});


test('Incomplete post', async t => {
    let group = await t.context.db.Group.create({
        name: 'authors'
    });
    await t.context.user.addGroup(group.id);

    let res = await t.context.request.post('/posts')
        .send({
            id: 3,
            markdown: 'Lorem ipsum',
            authorId: t.context.user.id,
            published: true
        }) // Forgot the title

    t.is(res.status, 400);
});
