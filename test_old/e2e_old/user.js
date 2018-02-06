'use strict';

const chai = require('chai');
const db = require('../models');
const expect = chai.expect;
const bcrypt = require('bcrypt');

chai.use(require('chai-http'));
const agent = global.agent;

describe('Users', () => {

    before(() => {

        db.User.create({
            email: 'foo@local.dev',
            password: 'secret',
            username: 'foo'


        });
    });

    describe('[GET]', () => {

        
    });

    describe('[POST]', () => {
        it('expect POST user to return the new user without errors', () =>
            agent.post('/users')
                .send({
                    email: 'groot@local.dev',
                    password: 'secret',
                    username: 'groot'

                })
                .then((res) => {
                    expect(res).to.have.status(201);
                    expect(res).to.be.json;

                    expect(res.body.username).to.be.equal('groot');
                    bcrypt.compare('secret', res.body.password)
                        .then((comp) => expect(comp).to.be.true)
                        .catch((err) => console.log(err));
                    expect(res.body.email).to.be.equal('groot@local.dev');
                    expect(res.body.createdAt).to.not.be.null;
                    expect(res.body.updatedAt).to.not.be.null;

                    it('expect the new user to exist in the database', () =>
                        db.User.findById(res.body.id)
                            .then((user) => {
                                expect(user).to.not.be.null;

                                expect(user.id).to.be.equal(res.body.id);
                                expect(user.username).to.be.equal('groot');
                                bcrypt.compare('secret', user.password)
                                    .then((comp) => expect(comp).to.be.true)
                                    .catch((err) => console.log(err));
                                expect(user.email).to.be.equal('groot@local.dev');
                                expect(user.createdAt).to.not.be.null;
                                expect(user.updatedAt).to.not.be.null;

                                return true;
                            }));

                    return true;

                }));

        it('expect POST user to return an error with status 400 when sending an incomplete request', () =>
            agent.post('/users')
                .send({
                    id: 2,
                    password: 'secret',
                    username: 'groot'
                })
                .catch((err) => {
                    expect(err).to.have.status(400);

                    return true;
                }));
    });

    describe('[PUT]', () => {
        it('expect PUT to update the user with id = 2 and return nothing with the status 204', () =>
            agent.put('/users/1')
                .send({
                    email: 'bar@local.dev',
                    password: 'secret',
                    username: 'bar'
                })
                .then((res) => {
                    expect(res).to.have.status(204);
                    expect(res.body).to.be.empty;

                    return true;
                }));

        it('expect to have the new values for the user with id = 2', () =>
            db.User.findOne({where: {username: 'bar'}})
                .then((user) => {
                    expect(user).to.not.be.null;

                    expect(user.id).to.be.equal(1);
                    expect(user.username).to.be.equal('bar');

                    bcrypt.compare('secret', user.password)
                        .then((comp) => expect(comp).to.be.true)
                        .catch((err) => console.log(err));

                    expect(user.email).to.be.equal('bar@local.dev');
                    expect(user.createdAt).to.not.be.null;
                    expect(user.updatedAt).to.not.be.null;
                    expect(user.updatedAt).to.not.be.equal(user.createdAt);

                    return true;
                }));

        it('expect PUT to return an error with the status 400 when sending an incomplete request', () =>
            agent.put('/users/2')
                .send({username: null})
                .catch((err) => {
                    expect(err).to.have.status(400);

                    return true;
                }));
    });


    describe('[DELETE]', () => {
        it('expect to DELETE user with id = 2 and return nothing with status 204', () =>
            agent.delete('/users/2')
                .then((res) => {

                    expect(res).to.have.status(204);
                    expect(res.body).to.be.empty;

                    return true;
                }));

        it('expect to not have the user in the database', () =>
            db.User.findById(2)
                .then((user) => {
                    expect(user).to.be.null;

                    return true;
                }));
    });


});
