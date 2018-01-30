'use strict';

const test = require('ava');
const SequelizeMock = require('sequelize-mock');
const bcrypt = require('bcrypt');
const repo = require('./repository');

const mock = new SequelizeMock();

const db = {};

db.User = mock.define('User', {
    username: 'foobar',
    email: 'foobar@mydomain.com',
    password: bcrypt.hashSync('fooPassword', 9)
});


test('password should match', async (t) => {
    const accepted = await repo.login(db, 'foobar', 'fooPassword');

    t.truthy(accepted);
});

test('password shouldn\t match', async (t) => {
    const accepted = await repo.login(db, 'foobar', 'someOtherPassword');

    t.falsy(accepted);
});

test('username shouldn\t match', async (t) => {
    const accepted = await repo.login(db, 'foobar2', 'fooPassword');

    t.falsy(accepted);
});
