'use strict';


const chai = require('chai');
const db = require('../models');

chai.use(require('chai-http'));
const expect = chai.expect;

let userInfo = {};
const agent = global.agent;
const userData = global.userData;

describe('Logs', () => {
    before(() =>
        db.User.find({where: {username: userData.username}})
            .then((user) => {
                userInfo = user;

                return true;
            }));

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

        it('expect an error when GET post with id = -3', () =>
            agent.get('/posts/-3')
                .then((data) => {
                    expect(data).to.be.null;

                    return true;
                })
                .catch((err) => {
                    expect(err).to.have.status(404);

                    return true;
                }));

        it('expect an error when GET post with id = abc', () => {
            agent.get('/posts/abc')
                .then((data) => {
                    expect(data).to.be.null;

                    return true;
                })
                .catch((err) => {
                    expect(err).to.have.status(400);

                    return true;
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
