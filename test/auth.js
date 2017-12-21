'use strict';

const chai = require('chai');
const db = require('../models');
const server = require('../app');
const expect = chai.expect;


chai.use(require('chai-http'));
const agent = chai.request.agent(server);


describe('Auth', () => {
    before('Create test user', () =>
        db.User.create({
            email: 'login@local.dev',
            password: 'password_test',
            username: 'login_test'
        }));

/**
 *
 */

    it('expect to fail to login (good user / bad password)', () =>
        agent.post('/auth/login')
            .send({
                username: 'login_test',
                password: 'qlmdkgsfk'
            })
            .then((res) => {
                expect(res).not.to.exist;

                return true;
            })
            .catch((err) => {
                expect(err).to.have.status(401);
            }));

    it('expect to login a user', () =>
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

    it('expect to logout a user', () =>
        agent.get('/auth/logout')
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;

                return true;
            }));

});
