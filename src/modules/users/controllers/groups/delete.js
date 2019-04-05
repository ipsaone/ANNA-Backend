'use strict';

const policy = require('../../user_policy');


module.exports = (db) => async function (req, res) {
    const userId = parseInt(req.params.userId, 10);
    const groupId = parseInt(req.params.groupId, 10);
    
    req.transaction.logger.info('Invoking policies');
    const allowed = await policy.filterDeleteGroup(db, req.body.groupId, userId, req.session.auth);
    if (!allowed) {
        req.transaction.logger.info('Policies denied request');
        return res.boom.unauthorized();
    }

    req.transaction.logger.info('Finding user');
    const user = await db.User.findByPk(userId);

    req.transaction.logger.info('Removing group');
    await user.removeGroup(groupId);

    req.transaction.logger.info('Sending empty response');
    return res.status(204).send();
};
