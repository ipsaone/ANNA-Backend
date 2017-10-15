'use strict';

const chai = require('chai');
const db = require('../models');
const server = require('../app');
const expect = chai.expect;

chai.use(require('chai-http'));

describe('Auth', () => {
    before(() => {
        return db.User.destroy({where: {}})
            .then(db.User.create({id: 1, username: 'foo', password: 'secret', email: 'foo@local.dev'}))
            .catch(err => console.log(err));
    });

// [POST] /auth/login
    describe('[POST] /auth/login', () => {
        it('expect to login a user', done => {
            chai.request(server)
                .post('/auth/login')
                .send({username: 'foo', password: 'secret'})
                .end((err, res) => {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);
                    done();
                });
        });

        it('checks login', done => {

            // TODO

            done();
        });
    });

// [POST] /auth/logout
    describe('[POST] /auth/logout', () => {
        it('expect to not have any errors and status 200', done => {
            chai.request(server)
                .get('/auth/logout')
                .end((err, res) => {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);
                    done();
                });
        });
    });

});