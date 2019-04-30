'use strict';

const policy = require('../event_policy');
const repo = require('../repositories');


module.exports = (db) =>

    async function (req, res) {

    // Check user is authorized
        req.transaction.logger.info('Invoking policies');
        const authorized = policy.filterIndex(req.transaction);

        if (!authorized) {
            req.transaction.logger.info('Policies denied access');
            return res.boom.unauthorized();
        }

        req.transaction.logger.info('Listing events');
        const list = await repo.list(db);

        // Send response
        req.transaction.logger.debug('Sending list');
        return res.status(200).json(list);
    };
