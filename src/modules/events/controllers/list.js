'use strict';

const policy = require('../event_policy');
const repo = require('../repositories');


module.exports = (db) =>

    async function (req, res) {

    // Check user is authorized
        const authorized = policy.filterIndex(db);

        if (!authorized) {
            return false;
        }

        const list = await repo.list(db);

        // Send response
        return res.status(200).json(list);
    };
