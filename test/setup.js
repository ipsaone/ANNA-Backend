'use strict';

const db = require('../models');

before('Init database',  () => {
        return db.sequelize.sync({force: true});
});

it('Forces initialization', done => {
    console.log('Initialized !')
    return done();
})
