'use strict';

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

    return db.User.create({
        email: 'login@local.dev',
        password: 'password_test',
        username: 'login_test'
    });
});



test.serial('User login', async t => {
    let SuccessRes = await request.post('/auth/login')
        .send({
            username: 'login_test',
            password: 'password_test'
        })

    t.true(SuccessRes.status == 200);

    let badPasswordRes = await request.post('/auth/login')
        .send({
            username: 'login_test',
            password: 'qlmdkgsfk'
        })
        
    t.true(badPasswordRes.status == 401)

    let badUserRes = await request.post('/auth/login')
        .send({
            username: 'login_test8',
            password: 'password_test'
        })
        
    t.true(badUserRes.status == 401)
});



test.serial('User logout', async t => {
    let res = await request.get('/auth/logout')
        
    t.true(res.status == 200);
});
