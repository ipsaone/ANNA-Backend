'use strict';

require('./setup');
require('./auth');

const tests = [];

tests.map((item) => require(`./${item}`));
