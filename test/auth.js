'use strict';

const chai = require('chai');
const db = require('../models');
const server = require('../app');
const expect = chai.expect;

chai.use(require('chai-http'));

describe('Auth', () => {
    before(() => {
        db.User.destroy({where: {}});
        db.User.create({id: 1, username: 'foo', password: 'secret', email: 'foo@local.dev'});
    });

// POST /auth
    describe('[POST] /login', () => {
        it('expect to login a user', done => {
            chai.request(server)
                .post('/auth')
                .send({username : 'foo', password: 'secret'})
                .end((err, res) => {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);
                    done();
                })

        })
    })

})