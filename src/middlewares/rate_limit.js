'use strict';

/**
 * @file
 * @see {@link module:rateLimit}
 */

/**
 * @module rateLimit
 */

/**
 * Rate limiter (DDOS security)
 * @constant RateLimit
 */
const RateLimit = require('express-rate-limit');

/**
 * Handles the rate limiting to avoid Denial-of-Service attacks
 * @function exports
 */
module.exports = new RateLimit({
    // 100 requests per minute
    delayMs: 0,
    max: 100,
    windowMs: 60 * 1000
});
