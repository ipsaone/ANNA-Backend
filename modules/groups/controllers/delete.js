'use strict';


module.exports = (db) => async function (req, res) {
    if (isNaN(parseInt(req.params.groupId, 10))) {
        throw res.boom.badRequest('Group ID must be an integer');
    }
    const groupId = parseInt(req.params.groupId, 10);

    const group = await db.Group.findByPk(groupId);

    if (!group) {
        throw res.boom.notFound();
    }

    await group.destroy({where: {id: groupId}});

    return res.status(204).json({});

};

