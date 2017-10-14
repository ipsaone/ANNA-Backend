'use strict';

const chai = require('chai');
const db = require('../models');
const server = require('../app');
const expect = chai.expect;

chai.use(require('chai-http'));

describe('Auth', () => {
    before(() => {
        return db.User.create({username: 'login_test', password: 'password_test', email: 'login@local.dev'});
    });
    

// POST /login
    describe('[POST] /login', () => {
        it('expect to login a user', done => {
            chai.request(server)
                .post('/auth/login')
                .send({username : 'login_test', password: 'password_test'})
                .end((err, res) => {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);
                    done();
                })
        })

        it('checks login', done => {
            
            // TODO

            done();
        });
    });

// POST /logout
    describe('[POST] /logout', () => {
        it('expect to logout a user', done => {
            chai.request(server)
            .post('/auth/logout')
            .end((err, res) => {
                expect(err).to.be.null;

                expect(res).to.have.status(200);
                done();
            });
        })
        
    });

})