'use strict';

const bcrypt = require('bcrypt');
module.exports = [
    {
        model: 'User',
        data: {
            username: 'foo',
            email: 'foo@domain.com',
            password: 'fooPassword'
        }
    },
    {
        model: 'User',
        data: {
            username: 'root',
            email: 'ipsa-one@one.ipsa.fr',
            password: 'OneServ_2017'
        }
    }
];