'use strict';

const chai = require('chai');
const db = require('../models');
const server = require('../app');
const expect = chai.expect;

chai.use(require('chai-http'));

describe('Auth', () => {
    before(() => {
        db.User.destroy({where: {}})
        .then(db.User.create({id: 1, username: 'foo', password: 'secret', email: 'foo@local.dev'}))
        .catch(err=>console.err(err));
        
    });

// POST /login
    describe('[POST] /login', () => {
        it('expect to login a user', done => {
            chai.request(server)
                .post('/auth/login')
                .send({username : 'foo', password: 'secret'})
                .end((err, res) => {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);
                    done();
                })
        })

        if('checks login', done => {
            
            // TODO

            done();
        });
    })

// POST /logout
    describe('[POST] /logout', () => {
        chai.request(server)
            .post('/auth/logout')
            .end((err, res) => {
                expect(err).to.be.null;

                expect(res).to.have.status(200);
                done();
            });
    });

})