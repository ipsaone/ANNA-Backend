'use strict';

const policy = require('../log_policy');

module.exports = (db) =>

    async function (req, res) {
        if (isNaN(parseInt(req.params.logId, 10))) {
            throw res.boom.badRequest('Log ID must be an integer');
        }
        const logId = parseInt(req.params.logId, 10);

        const allowed = await policy.filterUpdate(db, logId, req.session.auth);
        if (!allowed) {
            return res.boom.unauthorized();
        }

        const log = await db.Log.findByPk(logId);

        await log.update(req.body);

        return res.status(202).json(log);
    };
