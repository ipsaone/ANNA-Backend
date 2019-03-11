'use strict';


module.exports = (db) => async function (req, res) {
    if (typeof req.body.name !== 'string' || isNaN(parseInt(req.params.groupId, 10))) {
        throw res.boom.badRequest('Group ID must be an integer');
    }
    const groupId = parseInt(req.params.groupId, 10);
    const group = await db.Group.findByPk(groupId);

    req.body.name = req.body.name.toLowerCase();

    await group.update(req.body);
    return res.status(200).json(group);
};
