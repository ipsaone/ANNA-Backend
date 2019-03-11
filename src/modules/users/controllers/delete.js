'use strict';

const policy = require('../user_policy');

module.exports = (db) => async function (req, res) {
    if (isNaN(parseInt(req.params.userId, 10))) {
        throw res.boom.badRequest('User ID must be an integer');
    }
    const userId = parseInt(req.params.userId, 10);

    let authorized = policy.filterDelete(db, req.params.userId, req.session.auth);
    if(!authorized) {
        return res.boom.unauthorized();
    }

    await db.UserGroup.destroy({where: {userId}});
    await db.User.destroy({where: {id: userId}});

    return res.status(204).send();
};
