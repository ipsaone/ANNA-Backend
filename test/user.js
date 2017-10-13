'use strict';

const chai = require('chai');
const db = require('../models');
const server = require('../app');
const expect = chai.expect;
const bcrypt = require('bcrypt-nodejs');

chai.use(require('chai-http'));

describe('Users', () => {
    before(() => {
        return db.User.destroy({where: {}})
            .then(db.User.create({id: 1, username: 'foo', password: 'secret', email: 'foo@local.dev'}))
            .catch(err => console.err(err));
    });


// [GET] /users
    describe('[GET] /users', () => {
        it('expect to GET all users', done => {
            chai.request(server)
                .get('/users')
                .end((err, res) => {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body.length).to.be.equal(1);

                    expect(res.body[0].id).to.be.equal(1);
                    expect(res.body[0].username).to.be.equal('foo');
                    expect(bcrypt.compareSync('secret', res.body[0].password)).to.be.true;
                    expect(res.body[0].email).to.be.equal('foo@local.dev');

                    done();
                });
        });
    });


// [GET] /users/:id
    describe('[GET] /users/:id', () => {
        it('expect to GET user with id = 1', done => {
            chai.request(server)
                .get('/users/1')
                .end((err, res) => {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);
                    expect(res).to.be.json;

                    expect(res.body.id).to.be.equal(1);
                    expect(res.body.username).to.be.equal('foo');
                    expect(bcrypt.compareSync('secret', res.body.password)).to.be.true;
                    expect(res.body.email).to.be.equal('foo@local.dev');

                    done();
                });
        });

        it('expect an error when GET user with id = 2', done => {
            chai.request(server)
                .get('/users/2')
                .end((err, res) => {
                    expect(err).to.not.be.null;
                    expect(res).to.have.status(404);

                    done();
                });
        });
    });


// [POST] /users
    describe('[POST] /users', () => {
        it('expect POST user to return the new user without errors', done => {
            chai.request(server)
                .post('/users')
                .send({id: 2, username: 'groot', password: 'secret', email: 'groot@local.dev'})
                .end((err, res) => {
                    expect(err).to.be.null;

                    expect(res).to.have.status(201);
                    expect(res).to.be.json;

                    expect(res.body.id).to.be.equal(2);
                    expect(res.body.username).to.be.equal('groot');
                    expect(bcrypt.compareSync('secret', res.body.password)).to.be.true;
                    expect(res.body.email).to.be.equal('groot@local.dev');
                    expect(res.body.createdAt).to.not.be.null;
                    expect(res.body.updatedAt).to.not.be.null;

                    done();
                });
        });

        it('expect the new user to exist in the database', done => {
            db.User.findById(2)
                .then(user => {
                    expect(user.id).to.be.equal(2);
                    expect(user.username).to.be.equal('groot');
                    expect(bcrypt.compareSync('secret', user.password)).to.be.true;
                    expect(user.email).to.be.equal('groot@local.dev');
                    expect(user.createdAt).to.not.be.null;
                    expect(user.updatedAt).to.not.be.null;

                    done();
                });
        });

        it('expect POST user to return an error with status 400 when sending an incomplete request', done => {
            chai.request(server)
                .post('/users')
                .send({id: 2, username: 'groot', password: 'secret'}) // forgot the email
                .end((err, res) => {
                    expect(err).to.not.be.null;
                    expect(res).to.have.status(400);

                    done();
                });
        });
    });


// [PUT] /users/:id
    describe('[PUT] /users/:id', () => {
        it('expect PUT to update the user with id = 2 and return nothing with the status 204', done => {
            chai.request(server)
                .put('/users/2')
                .send({username: 'bar', password: 'secret', email: 'bar@local.dev'})
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(204);
                    expect(res.body).to.be.empty;

                    done();
                });
        });

        it('expect to have the new values for the user with id = 2', done => {
            db.User.findById(2)
                .then(user => {
                    expect(user.id).to.be.equal(2);
                    expect(user.username).to.be.equal('bar');
                    expect(bcrypt.compareSync('secret', user.password)).to.be.true;
                    expect(user.email).to.be.equal('bar@local.dev');
                    expect(user.createdAt).to.not.be.null;
                    expect(user.updatedAt).to.not.be.null;
                    expect(user.updatedAt).to.not.be.equal(user.createdAt);

                    done();
                });
        });

        it('expect PUT to return an error with the status 400 when sending an incomplete request', done => {
            chai.request(server)
                .put('/users/2')
                .send({username: null})
                .end((err, res) => {
                    expect(err).to.not.be.null;
                    expect(res).to.have.status(400);

                    done();
                });
        });
    });


// [DELETE] /users/:id
    describe('[DELETE] /users/:id', () => {
        it('expect to DELETE user with id = 2 and return nothing with status 204', done => {
            chai.request(server)
                .delete('/users/2')
                .end((err, res) => {
                    expect(err).to.be.null;

                    expect(res).to.have.status(204);
                    expect(res.body).to.be.empty;

                    done();
                });
        });

        it('expect to not have the user in the database', done => {
            db.User.findById(2)
                .then(user => {
                    expect(user).to.be.null;

                    done();
                })
                .catch(err => {
                    expect(err).to.not.be.null;

                    done();
                });
        });
    });
});