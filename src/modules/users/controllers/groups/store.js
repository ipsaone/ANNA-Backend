'use strict';

const policy = require('../../user_policy');


module.exports = (db) => async function (req, res) {
    const userId = parseInt(req.params.userId, 10);
    const groupId = parseInt(req.params.groupId, 10);


    req.transaction.logger.info('Invoking policies');
    const allowedP = policy.filterAddGroup(db, groupId, userId, req.session.auth);

    req.transaction.logger.info('Finding user');
    const user = await db.User.findByPk(userId);
    if (!user) {
        req.transaction.logger.info('User not found');
        return res.boom.badRequest('User not found');
    }

    req.transaction.logger.info('Awaiting policies');
    const allowed = await allowedP;

    if (!allowed) {
        req.transaction.logger.info('Policies denied access');
        return res.boom.unauthorized();
    }

    req.transaction.logger.info('Adding group');
    await user.addGroup(groupId);
    await user.save();

    req.transaction.logger.info('Sending empty response');
    return res.status(204).send();
};
