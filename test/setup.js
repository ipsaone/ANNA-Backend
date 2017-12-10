'use strict';

const db = require('../models');

describe('Initialization', () => {
    before('Init database', () => db.sequelize.sync({force: true}));

    it('Forces initialization', (done) => done());

});
