'use strict';

require('./setup');

const tests = ['auth'];

tests.map((item) => require(`./${item}`));
