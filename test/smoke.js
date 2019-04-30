'use strict';

process.env.TEST = true;

const test = require('ava');

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');

const supertest = require('supertest');

test('Real startup smoke test', async t => {
    const loadApp = require(path.join(root, 'src', './app'));
    let {app, modules} = loadApp();
    
    const request = require('supertest').agent(app);

    let res = await request.get('/');
    t.is(res.status, 200);
    
});