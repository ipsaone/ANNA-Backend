'use strict';

const chai = require('chai');
const db = require('../models');
const server = require('../app');
const expect = chai.expect;

chai.use(require('chai-http'));

describe('Storage', () => {
    before(done => {
       db.User.create({username: 'file_owner', password: 'ilovefiles', email: 'filemgr@local.dev'})
        .then(owner => {
            db.Group.create({name: 'file_test'}).then(group => {
                owner.addGroup(group.id);
                db.File.create({path: '/testfile', ownerId: owner.id, groupId: group.id});
                done();
            })
        })
        
    });

// GET /*
    describe('[GET] /*', () => {
        it('expect to test', done => {
           done();

        })
    });

})