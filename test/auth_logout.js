'use strict';

const chai = require('chai');
const db = require('../models');
const server = require('../app');
const expect = chai.expect;

chai.use(require('chai-http'));

describe('Auth', () => {

// GET /logout
    describe('[GET] /logout', () => {
        it('expect to logout a user', done => {
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
