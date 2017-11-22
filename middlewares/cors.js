'use strict';

const cors = require('cors'); // Cross Origin Resource Sharing

function getOrigin (origin, cb) {
    cb(null, true);
}

module.exports = cors({
    origin: getOrigin,
    credentials: true
});
