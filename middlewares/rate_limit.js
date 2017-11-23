'use strict';

const rateLimit = require('express-rate-limit'); // Rate limiter (DDOS security)

module.exports = new rateLimit({
    // 100 requests per minute
    windowMs: 60 * 1000,
    max: 100,
    delayMs: 0
});
