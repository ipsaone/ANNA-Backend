'use strict';

const cors = require('cors'); // Cross Origin Resource Sharing

module.exports = cors({
    origin: function(origin, cb){ cb(null, true); },
    credentials: true
});
