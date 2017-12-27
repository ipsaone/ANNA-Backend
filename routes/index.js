/* eslint new-cap: 0*/

'use strict';

const router = require('express').Router();
const config = require('../config/config');

// Homepage
router.get('/', (req, res) => {
    res.json({
        'AppName': config.app.name,
        'Version': config.app.version
    });
});

router.post('/', (req, res) => {
    const session = req.session;

    if (session.views) {
        session.views += 1;
        session.save();
        res.json({
            test: true,
            views: session.views
        });
    } else {
        session.views = 1;
        session.save();
        res.end('welcome to the session demo. refresh!');
    }
});

// Importing routes
router.use('/auth', require('./auth'));
router.use('/groups', require('./groups'));
router.use('/posts', require('./posts'));
router.use('/storage', require('./storage'));
router.use('/users', require('./users'));
router.use('/logs', require('./logs'));
router.use('/image', require('./image'));
router.use('/mission', require('./mission'));
router.use('/events', require('./events'));

// Export the router
module.exports = router;
