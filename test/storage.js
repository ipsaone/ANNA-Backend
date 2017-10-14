'use strict';

const chai = require('chai');
const db = require('../models');
const server = require('../app');
const expect = chai.expect;

chai.use(require('chai-http'));

describe('Storage', () => {
    before(() => {
       return db.sequelize.sync({force: true});
        
    });

// POST /login
    describe('test 1', () => {
        it('expect to test', done => {
            done();
        })
    });

})