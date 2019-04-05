'use strict';



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
        throw res.boom.notFound();
    }

    req.transaction.logger.info('Returning user');
    return res.status(200).json(user);

};
