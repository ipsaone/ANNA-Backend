'use strict';



module.exports = (db) => async function (req, res) {
    req.transaction.logger.info('Finding all groups');
    const groups = await db.Group.findAll({include: ['users']});

    req.transaction.logger.info('Returning all groups');
    return res.json(groups);
};

