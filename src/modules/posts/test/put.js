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

test('Update', async t => {
    let post = await t.context.db.Post.create({
        title: 'Lorem ipsum',
        markdown: '#Lorem ipsum',
        authorId: t.context.user.id
    });

    let group = await t.context.db.Group.create({
        name: 'authors'
    });
    await t.context.user.addGroup(group.id);

    let res = await t.context.request.put('/posts/'+post.id)
        .send({
            title: 'Edited title',
            published: false
        })

    t.is(res.status, 200);

    let post2 = await t.context.db.Post.findByPk(post.id)
           
    t.is(post2.title, 'Edited title');
    t.false(post2.published)
    t.not(post2.updatedAt, post2.createdAt);


});

test.todo('Pinned post');