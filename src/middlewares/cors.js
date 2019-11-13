'use strict';

const cors = require('cors'); // Cross Origin Resource Sharing
const winston = require('winston');


module.exports = cors({
    origin: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 200
});
