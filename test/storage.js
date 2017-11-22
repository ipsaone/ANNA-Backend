'use strict';

const chai = require('chai');
const db = require('../models');
const server = require('../app');
const expect = chai.expect;
const seed_and_login = require('./seed_and_login');

chai.use(require('chai-http'));

describe('Storage', () => {
    before(() =>
        seed_and_login().
            then(() => db.User.create({
                username: 'file_owner',
                password: 'ilovefiles',
                email: 'filemgr@local.dev'
            })).
            then((owner) => db.Group.create({name: 'file_test'}).
                then((group) => owner.addGroup(group.id).then(() => db.File.create({isDir: false})))));

    // GET /*
    describe('[GET] /*', () => {
        it('expect to test', (done) => {
            done();

        });
    });

});
