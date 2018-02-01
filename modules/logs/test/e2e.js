'use strict'

process.env.TEST = true;

const test = require('ava');

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');

const supertest = require('supertest');
const server = require(path.join(root, './app'));

let ModulesFactory = require(path.join(root, './modules'));
let modules = new ModulesFactory({test: true});

const db = modules.db;

const loadApp = require(path.join(root, './app'));
let app = loadApp({test: true, noLog: true});
const request = supertest.agent(app)



test.before(async t => {
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS=0;')
    await db.sequelize.sync({force: true});
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS=1;')

    await db.User.create({
        email: 'login@local.dev',
        password: 'password_test',
        username: 'login_test'
    });
    await request.post('/auth/login')
        .send({
            username: 'login_test',
            password: 'password_test'
        });

    return true;

});


test.serial('Log addition', async t => {
    let res = await request.post('/logs')
        .send({
            title: "test",
            markdown: "#TEST"
        })

    t.true(res.status == 201);
    t.true(res.body.title == 'test')
});

test.serial('List logs', async t => {
    // Insert log
    let insert = await request.post('/logs')
        .send({
            title: "test",
            markdown: "#TEST"
        })
    let insertId = insert.body.id;
    t.true(insert.status == 201);

    // Fetch
    let res = await request.get('/logs/'+insertId)
    t.true(res.status == 200);
});


test.serial('Show log', async t => {
    let res = await request.get('/logs')

    t.true(res.status == 200);
    t.true(res.body.length > 1);
});



test.serial('Log edition', async t => {
    // Insert log
    let insert = await request.post('/logs')
        .send({
            title: "test_283",
            markdown: "#TEST"
        })
    let insertId = insert.body.id;
    t.true(insert.status == 201);

    // Edit log (success)
    let successRes = await request.put('/logs/'+insertId)
        .send({
            markdown: '#EDITED_TEST'
        })

    t.true(successRes.status == 202);
    t.true(successRes.body.markdown == '#EDITED_TEST')

    // Edit log (failure)
    let failureRes = await request.put('/logs/'+insertId)
        .send({
            content: 'I HAVE BEEN EDITED'
        })

    t.true(failureRes.status == 401)
});



test.serial('Log deletion', async t => {
    // Insert log
    let insert = await request.post('/logs')
        .send({
            title: "test_283",
            markdown: "#TEST"
        })
    let insertId = insert.body.id;
    t.true(insert.status == 201);

    // Delete log
    let res = await request.delete('/logs/'+insertId);
    t.true(res.status == 204);

});