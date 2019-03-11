'use strict';

const RateLimit = require('express-rate-limit');

module.exports = new RateLimit({
    // 100 requests per minute
    delayMs: 0,
    max: 100,
    windowMs: 60 * 1000
});
