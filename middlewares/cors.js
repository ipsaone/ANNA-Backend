'use strict';

/**
 * @file
 * @see {@link module:cors}
 */

/**
 * @module cors
 */

const cors = require('cors'); // Cross Origin Resource Sharing
const winston = require('winston');


/**
 * Manages the Cross-Origin Request Security settings
 * @function exports
 */
winston.debug('Cross-origin ok');
module.exports = cors({
    origin: (origin, cb) => {
        cb(null, true);
    },
    credentials: true
});
