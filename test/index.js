'use strict';

require('./setup');

const tests = [
    'auth'

/*
 *    'user',
 *    'post',
 *    'log',
 *    'mission',
 *    'event'
 */
];

tests.map((item) => require(`./${item}`));
