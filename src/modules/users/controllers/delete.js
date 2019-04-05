'use strict';

const policy = require('../user_policy');

module.exports = (db) => async function (req, res) {
    const userId = parseInt(req.params.userId, 10);

    req.transaction.logger.info('Invoking policies');
    let authorized = policy.filterDelete(db, req.params.userId, req.session.auth);
    if(!authorized) {
        req.transaction.logger.info('Policies denied access');
        return res.boom.unauthorized();
    }

    req.transaction.logger.info('Destroyign user groups');
    await db.UserGroup.destroy({where: {userId}});

    req.transaction.logger.info('Destroying user');
    await db.User.destroy({where: {id: userId}});

    req.transaction.logger.info('Sending empty response');
    return res.status(204).send();
};
