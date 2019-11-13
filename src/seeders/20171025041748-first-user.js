/* eslint no-sync: "off" */

'use strict';

const bcrypt = require('bcrypt');
const salt = require('../config/config').password.salt;

module.exports = {
    up: (queryInterface) => 
        Promise.all([
            queryInterface.bulkInsert('Users', [
                {
                    username: 'root',
                    email: 'ipsaone@one.ipsa.fr',
                    createdAt: new Date(Date.now()),
                    updatedAt: new Date(Date.now()),
                    id: 1
                }
            ]),

            queryInterface.bulkInsert('UserSecrets', [
                {
                    id: 1,
                    password: bcrypt.hashSync('OneServ_2017', salt),
                    userId: 1
                }
            ]),
        ]),

    down: (queryInterface) => 
        Promise.all([
            queryInterface.bulkDelete('Users', null, {}),
            queryInterface.bulkDelete('UserSecrets', null, {})
        ])
};
