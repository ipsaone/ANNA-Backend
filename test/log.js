'use strict';


const chai = require('chai');
const db = require('../models');
const server = require('../app');
const expect = chai.expect;
const seedAndLogin = require('./seed_and_login');

chai.use(require('chai-http'));
const agent = chai.request.agent(server);

let userInfo = {};

describe('Logs', () => {
    before(() =>
        seedAndLogin(agent)
            .then((userData) => db.User.find({where: {username: userData.username}})
                .then((user) => {
                    userInfo = user;

                    return true;
                })));

    describe('[GET]', () => {
        it('Expect to get all logs', () =>
            agent.get('/logs')
                .then((res) => {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;

                    expect(userInfo).to.not.be.empty;

                    return true;
                }));

        it('Expect to get log with id = 4', () => {
            agent.get('/logs/4')
                .then((res) => {
                    expect(res).to.have.status(200);

                    return true;
                })
                .catch((err) => {
                    throw err;
                });
        });
    });

    describe('[POST]', () => {

    });

    describe('[PUT]', () => {

    });

    describe('[DELETE]', () => {

    });

});
