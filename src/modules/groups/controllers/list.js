'use strict';

/**
 * @api {get} /groups List all the groups
 * @apiName list
 * @apiGroup Groups
 * 
 * @apiSuccess {object} groups The list of groups
 */

let policy = require("../group_policy");

module.exports = (db) => async function (req, res) {
    req.transaction.logger.info('Finding all groups');
    const groups = await db.Group.findAll({include: ['users']});

    const allowed = policy.filterList(req.transaction);
    if(!allowed) {
        return res.boom.unauthorized();
    }

    req.transaction.logger.info('Returning all groups');
    return res.json(groups);
};

