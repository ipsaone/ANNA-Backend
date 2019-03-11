'use strict';

const policy = require('../log_policy');


module.exports = (db) =>

    async function (req, res) {
        let logs = await  db.Log.findAll({include: ['author']});
        logs = await policy.filterIndex(db, logs, req.session.auth);
        res.status(200).json(logs);
    };
