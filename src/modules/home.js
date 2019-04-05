'use strict';

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');

/* eslint new-cap: 0 */
const router = require('express').Router();
const config = require(path.join(root, './src/config/config'));

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

module.exports.routes = router;
