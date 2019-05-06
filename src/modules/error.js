'use strict';

/* eslint new-cap: 0 */
const router = require('express').Router();

// normal error
router.get('/', (req, res) => {
    throw "This is an error for internal testing";
});

module.exports.routes = router;

