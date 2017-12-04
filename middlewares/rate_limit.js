'use strict';

const RateLimit = require('express-rate-limit'); // Rate limiter (DDOS security)

module.exports = new RateLimit({
    // 100 requests per minute
    windowMs: 60 * 1000,
    max: 100,
    delayMs: 0
});
