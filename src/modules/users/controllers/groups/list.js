'use strict';

// Const policy = require('../../user_policy');



module.exports = (db) => async function (req, res) {
    if (isNaN(parseInt(req.params.userId, 10))) {
        req.transaction.logger.info('User ID must be an integer');
        return res.boom.badRequest('User ID must be an integer');
    }
    const userId = parseInt(req.params.userId, 10);

    req.transaction.logger.info('Finding user');
    let user = await db.User.findOne({
        where: {id: userId},
        include: ['groups']
    });

    if(!user) {
        req.transaction.logger.info('User not found');
        return res.boom.badRequest('User not found');
    }
    
    req.transaction.logger.info('Returning user groups');
    return res.status(200).json(user.groups);
    
};
