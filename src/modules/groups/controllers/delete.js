'use strict';

let policy = require("../group_policy");

module.exports = (db) => async function (req, res) {
    if (isNaN(parseInt(req.params.groupId, 10))) {
        req.transaction.logger.info('Group ID must be an integer');
        throw res.boom.badRequest('Group ID must be an integer');
    }
    const groupId = parseInt(req.params.groupId, 10);

    const allowed = policy.filterDelete(req.transaction);
    if(!allowed) {
        return res.boom.unauthorized();
    }

    req.transaction.logger.info('Finding group');
    const group = await db.Group.findByPk(groupId);

    if (!group) {
        req.transaction.logger.info('Group not found');
        throw res.boom.notFound();
    }

    req.transaction.logger.info('Destroying group');
    await group.destroy({where: {id: groupId}});

    req.transaction.logger.debug('Returning empty response');
    return res.status(204).json({});

};

