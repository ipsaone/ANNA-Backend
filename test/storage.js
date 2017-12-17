'use strict';

const chai = require('chai');
const db = require('../models');

chai.use(require('chai-http'));

describe('Storage', () => {
    before(() => db.User.create({
        email: 'filemgr@local.dev',
        password: 'ilovefiles',
        username: 'file_owner'
    })
        .then((owner) => db.Group.create({name: 'file_test'})
            .then((group) => owner.addGroup(group.id).then(() => db.File.create({isDir: false})))));

    // GET /*
    describe('[GET] /*', () => {
        it('expect to test', (done) => {
            done();
        });
    });

});
