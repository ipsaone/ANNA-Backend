'use strict';

const db = require('../models');

describe('Initialization', () => {
    before('Init database',  () => {
            return db.sequelize.sync({force: true});
    });

    it('Forces initialization', done => {
        return done();
    })

})
