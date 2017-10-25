'use strict';

const bcrypt = require('bcrypt');
const salt = require('../config/config').password.salt;

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('Users', [{
            username: 'FooBar',
            password: bcrypt.hashSync('secret', salt),
            email: 'foobar@local.dev',
            createdAt: new Date(Date.now()),
            updatedAt: new Date(Date.now())
        }]);
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Users', null, {});
    }
};
