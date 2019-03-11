'use strict';

const cors = require('cors'); // Cross Origin Resource Sharing
const winston = require('winston');


module.exports = cors({
    origin: (origin, cb) => {
        cb(null, true);
    },
    credentials: true
});
