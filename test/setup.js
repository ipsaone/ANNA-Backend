'use strict';

const chai = require('chai');
const db = require('../models');

before('Init database', () => {
    return db.sequelize.sync({force: true});
});