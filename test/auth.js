'use strict';

const chai = require('chai');
const db = require('../models');
const server = require('../app');
const expect = chai.expect;


chai.use(require('chai-http'));
const agent = chai.request.agent(server);

describe('Auth', () => {
    before('Create test user', () =>
        db.sequelize.sync().
            then(() =>
                db.User.create({
                    username: 'login_test',
                    password: 'password_test',
                    email: 'login@local.dev'
                })));

    it('expect to login a user', () =>
        agent.post('/auth/login').
            send({
                username: 'login_test',
                password: 'password_test'
            }).
            then((res) => {

                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.error).to.be.undefined;


            }));

    it('expect to logout a user', () =>
        agent.get('/auth/logout').
            then((res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
            }));

});
