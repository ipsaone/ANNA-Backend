'use strict';



module.exports = (db) => async function (req, res) {
    const groups = await db.Group.findAll({include: ['users']});

    return res.json(groups);
};

