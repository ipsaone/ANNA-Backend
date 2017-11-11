'use strict';

const boom = require('boom');

module.exports = (err, req, res, next) => {
    res.send(boom.isBoom(err) ? err : boom.badImplementation(err.message));
}
