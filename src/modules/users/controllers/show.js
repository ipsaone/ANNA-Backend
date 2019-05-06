'use strict';

const policy = require('../user_policy');

module.exports = (db) => async function (req, res) {
    if (isNaN(parseInt(req.params.userId, 10))) {
        req.transaction.logger.info('User ID must be an integer');
        throw res.boom.badRequest('User ID must be an integer');
    }
    const userId = parseInt(req.params.userId, 10);

    req.transaction.logger.info('Finding user');
    const user = await db.User.findOne({
        where: {id: userId},
        include: [
            'groups',
            'events',
            'participatingMissions',
            'leaderMissions'
        ]
    });

    if (!user) {
        req.transaction.logger.info('User not found');
        return res.boom.notFound();
    }

    req.transaction.logger.info('Invoking policies');
    let filteredUser = await policy.filterShow(req.transaction, user);
    if(!filteredUser) {
        req.transaction.logger.info('Policies denied access');
        return res.boom.unauthorized();
    }

    req.transaction.logger.info('Returning user');
    return res.status(200).json(filteredUser);

};
