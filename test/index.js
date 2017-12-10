'use strict';

require('./setup');

const tests = [
    'auth',
    'log'
];

tests.map((item) => require(`./${item}`));
