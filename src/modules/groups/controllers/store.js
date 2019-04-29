'use strict';


module.exports = (db) => async function (req, res) {
    if (typeof req.body.name !== 'string') {
        req.transaction.logger.info('Bad request, group name not a string');
        throw res.boom.badRequest('Group name must be a string');
    }
    req.body.name = req.body.name.toLowerCase();

    req.transaction.logger.error("GROUP POLICIES NEEDED !!!");

    req.transaction.logger.info('Creating group');
    const group = await db.Group.create(req.body);

    req.transaction.logger.info('Returning new group');
    return res.status(201).json(group);
};
