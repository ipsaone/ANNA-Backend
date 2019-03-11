'use strict';

const policy = require('../log_policy');



module.exports = (db) =>

    async function (req, res) {
        let authorized = policy.filterStore(db, req.session.auth);
        if(!authorized) {
            return res.boom.unauthorized();
        }

        let log = await db.Log.create(req.body);
        return res.status(201).json(log);
    };
