'use strict';

const chai = require('chai');
const db = require('../models');
const server = require('../app');
const expect = chai.expect;
const bcrypt = require('bcrypt');
const seedAndLogin = require('./seed_and_login');

chai.use(require('chai-http'));
const agent = chai.request.agent(server);

describe('Users', () => {

    before(() =>
        seedAndLogin(agent)
            .then((user) => {
                db.User.create({
                    email: 'foo@local.dev',
                    password: 'secret',
                    username: 'foo',

                });
                db.User.find({username: user.username});
            }));

    describe('[GET]', () => {

        it('expect to GET all users', () =>
            agent.get('/users')
                .then((res) => {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body.length).to.be.within(10, 40); // See seed_and_login
                }));

        it('expect to GET user with id = 1', () =>
            agent.get('/users/1')
                .then((res) => {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;

                }));

        it('expect an error when GET user with id = -3', () =>
            agent.get('/users/-3')
                .then((res) => {
                    expect(res).to.have.status(404);

                }));

        it('expect an error when GET user with id = abc', () => {
            agent.get('/users/abc')
                .catch((err) => {
                    expect(err).to.have.status(404);
                });
        });
    });

    describe('[POST]', () => {
        it('expect POST user to return the new user without errors', () =>
            agent.post('/users')
                .send({
                    email: 'groot@local.dev',
                    id: 2,
                    password: 'secret',
                    username: 'groot',

                })
                .then((res) => {
                    expect(res).to.have.status(201);
                    expect(res).to.be.json;

                    expect(res.body.id).to.be.integer;
                    expect(res.body.username).to.be.equal('groot');
                    bcrypt.compare('secret', res.body.password).then((comp) => expect(comp).to.be.true);
                    expect(res.body.email).to.be.equal('groot@local.dev');
                    expect(res.body.createdAt).to.not.be.null;
                    expect(res.body.updatedAt).to.not.be.null;

                    it('expect the new user to exist in the database', () =>
                        db.User.findById(res.body.id)
                            .then((user) => {
                                expect(user).to.not.be.null;

                                expect(user.id).to.be.equal(res.body.id);
                                expect(user.username).to.be.equal('groot');
                                bcrypt.compare('secret', user.password).then((comp) => expect(comp).to.be.true);
                                expect(user.email).to.be.equal('groot@local.dev');
                                expect(user.createdAt).to.not.be.null;
                                expect(user.updatedAt).to.not.be.null;

                            }));

                }));

        it('expect POST user to return an error with status 400 when sending an incomplete request', () =>
            agent.post('/users')
                .send({
                    id: 2,
                    password: 'secret',
                    username: 'groot',
                })
                .then((res) => {
                    expect(res).to.have.status(400);
                }));
    });

    describe('[PUT]', () => {
        it('expect PUT to update the user with id = 2 and return nothing with the status 204', () =>
            agent.put('/users/1')
                .send({
                    email: 'bar@local.dev',
                    password: 'secret',
                    username: 'bar',
                })
                .then((res) => {
                    expect(res).to.have.status(204);
                    expect(res.body).to.be.empty;

                }));

        it('expect to have the new values for the user with id = 2', () =>
            db.User.findOne({where: {username: 'bar'}})
                .then((user) => {
                    expect(user).to.not.be.null;

                    expect(user.id).to.be.equal(1);
                    expect(user.username).to.be.equal('bar');

                    bcrypt.compare('secret', user.password).then((comp) => expect(comp).to.be.true);

                    expect(test).to.be.true;
                    expect(user.email).to.be.equal('bar@local.dev');
                    expect(user.createdAt).to.not.be.null;
                    expect(user.updatedAt).to.not.be.null;
                    expect(user.updatedAt).to.not.be.equal(user.createdAt);

                }));

        it('expect PUT to return an error with the status 400 when sending an incomplete request', () =>
            agent.put('/users/2')
                .send({username: null})
                .then((res) => {
                    expect(res).to.have.status(400);

                }));
    });


    describe('[DELETE]', () => {
        it('expect to DELETE user with id = 2 and return nothing with status 204', () =>
            agent.delete('/users/2')
                .then((res) => {

                    expect(res).to.have.status(204);
                    expect(res.body).to.be.empty;

                }));

        it('expect to not have the user in the database', () =>
            db.User.findById(2)
                .then((user) => {
                    expect(user).to.be.null;
                }));
    });


});
