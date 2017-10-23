'use strict';

const chai = require('chai');
const db = require('../models');

before('Init database', () => {
    return db.sequelize.query("SET FOREIGN_KEY_CHECKS = 0")
        .then(() => db.sequelize.sync({force: true}))
        .then(() => db.sequelize.query("SET FOREIGN_KEY_CHECKS = 1"))
        
});