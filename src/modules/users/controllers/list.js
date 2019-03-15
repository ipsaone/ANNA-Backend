'use strict';



module.exports = (db) => async function (req, res) {
    req.transaction.logger.info('Finding all users');
    const users = await db.User.findAll();


    req.transaction.logger.info('Sending users');
    return res.status(200).json(users);
};
