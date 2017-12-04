'use strict';

const RateLimit = require('express-rate-limit'); // Rate limiter (DDOS security)

module.exports = new RateLimit({
    // 100 requests per minute
    delayMs: 0,
    max: 100,
    windowMs: 60 * 1000
});
