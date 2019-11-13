'use strict';

const policy = require('../log_policy');


module.exports = (db) =>

    async function (req, res, handle) {
        if (isNaN(parseInt(req.params.logId, 10))) {
            throw res.boom.badRequest('Log ID must be an integer');
        }
        const logId = parseInt(req.params.logId, 10);

        let log = await db.Log.findOne({
            where: {id: logId},
            include: [
                'author',
                'files',
                'helpers'
            ]
        })

        log = await policy.filterShow(db, log, req.session.auth);
        if (log) {
            return res.status(200).json(log);
        }

        return res.boom.notFound();
    };
