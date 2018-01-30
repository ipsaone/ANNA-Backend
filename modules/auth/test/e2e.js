'use strict';

const test = require('ava');
const chai = require('chai');
const server = require('../app');
const expect = chai.expect;
const db = require.main.require('./modules').models


chai.use(require('chai-http'));
const agent = chai.request.agent(server);


test.before(t =>
    db.User.create({
        email: 'login@local.dev',
        password: 'password_test',
        username: 'login_test'
    }));


test('expect to fail to login (good user / bad password)', async t => {
    let res = await agent.post('/auth/login')
        .send({
            username: 'login_test',
            password: 'qlmdkgsfk'
        })
        
    console.log(res)
    t.truthy(res.status(200))

}

test('expect to login a user', t =>
    agent.post('/auth/login')
        .send({
            username: 'login_test',
            password: 'password_test'
        })
        .then((res) => {

            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body.error).to.be.undefined;

            return true;
        }));

test('expect to logout a user', t =>
    agent.get('/auth/logout')
        .then((res) => {
            expect(res).to.have.status(200);
            expect(res).to.be.json;

            return true;
        }));

