'use strict';

const chai = require('chai');
const db = require('../models');
const server = require('../app');
const expect = chai.expect;
const seedAndLogin = require('./seed_and_login');

chai.use(require('chai-http'));
const agent = chai.request.agent(server);

let userInfo = {};

describe('Mission', () => {
    before(() =>
        seedAndLogin(agent)
            .then((userData) => db.User.find({where: {username: userData.username}})
                .then((user) => {
                    userInfo = user;

                    return true;
                })));

    describe('[GET]', () => {
        it('Expect to get all missions', () =>
            agent.get('/missions')
                .then((res) => {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;

                    expect(userInfo).to.not.be.empty;

                    return true;
                }));
        it('Expect to get mission with id = 4', () => {
            agent.get('/missions/4')
                .then((res) => {
                    expect(res).to.have.status(200);

                    return true;
                })
                .catch((err) => {
                    throw err;
                });
        });
    });
});
