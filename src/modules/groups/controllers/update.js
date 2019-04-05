'use strict';


module.exports = (db) => async function (req, res) {
    if (typeof req.body.name !== 'string' || isNaN(parseInt(req.params.groupId, 10))) {
        req.transaction.logger.info('Group ID must be an integer');
        throw res.boom.badRequest('Group ID must be an integer');
    }
    const groupId = parseInt(req.params.groupId, 10);

    req.transaction.logger.info('Finding group');
    const group = await db.Group.findByPk(groupId);

    req.body.name = req.body.name.toLowerCase();

    req.transaction.logger.info('Updating group');
    await group.update(req.body);

    req.transaction.logger.info('Returning updated group');
    return res.status(200).json(group);
};
