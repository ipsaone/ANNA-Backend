'use strict';


module.exports = (db) => async function (req, res) {
    req.transaction.logger.debug('Invoking group show controller')
    const groupId = parseInt(req.params.groupId, 10);

    req.transaction.logger.error("GROUP POLICIES NEEDED !!!");

    req.transaction.logger.info('Finding group');
    const group = await db.Group.findOne({
        where: {id: groupId},
        include: ['users']
    });

    if (!group) {
        req.transaction.logger.info('Group not found');
        throw res.boom.notFound();
    }

    req.transaction.logger.info('Group found, sending response');
    return res.status(200).json(group);
};
