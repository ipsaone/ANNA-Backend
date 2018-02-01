'use strict';


const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');

const test = require('ava');
const bcrypt = require('bcrypt');
const repo = require('../login/repository');
const ModulesFactory = require(path.join(root, './modules'));

let modules = new ModulesFactory({test: true})


test('password should match', async (t) => {
    const db = await modules.unitTest();

    const accepted = await repo.login(db, 'foo', 'fooPassword');
    t.truthy(accepted);
});

test('password shouldn\'t match', async (t) => {
    const db = await modules.unitTest();
    const accepted = await repo.login(db, 'foo', 'someOtherPassword');

    t.falsy(accepted);
});

test('username shouldn\'t match', async (t) => {
    const db = await modules.unitTest();
    const accepted = await repo.login(db, 'foobar', 'fooPassword');

    t.falsy(accepted);
});
