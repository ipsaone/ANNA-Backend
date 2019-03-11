'use strict';



module.exports = (db) => async function (req, res) {
    const users = await db.User.findAll();


    return res.status(200).json(users);
};
