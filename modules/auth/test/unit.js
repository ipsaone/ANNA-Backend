'use strict';


const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');

const test = require('ava');
const bcrypt = require('bcrypt');
const repo = require('../login/repository');
const ModulesFactory = require(path.join(root, './modules'));

let modules = new ModulesFactory({test: true})


test('Login', async (t) => {
    const db = await modules.unitTest();

    const accepted = await repo.login(db, 'foo', 'fooPassword');
    t.truthy(accepted);

    const badPassword = await repo.login(db, 'foo', 'someOtherPassword');
    t.falsy(badPassword);

    const badUser = await repo.login(db, 'foobar', 'fooPassword');
    t.falsy(badUser);
});
