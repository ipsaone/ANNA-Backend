'use strict';

const policy = require('../user_policy');

module.exports = (db) => async function (req, res) {
    req.transaction.logger.info('Finding all users');
    const users = await db.User.findAll();

    let filteredData = await policy.filterIndex(db, users, req.session.id);

    req.transaction.logger.info('Sending users');
    return res.status(200).json(filteredData);
};
