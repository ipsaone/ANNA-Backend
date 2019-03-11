'use strict';


module.exports = (db) => async function (req, res) {
    if (typeof req.body.name !== 'string') {

        throw res.boom.badRequest('Group name must be an integer');
    }

    req.body.name = req.body.name.toLowerCase();

    const group = await db.Group.create(req.body);

    return res.status(201).json(group);
};
