'use strict';

/**
 * @api {put} /groups/:groupId Update a group
 * @apiName update
 * @apiGroup Groups
 * 
 * @apiParam {string} [name] The group name
 * 
 * @apiSuccess {object} group The group information
 */

let policy = require("../group_policy");
const joi = require('joi');

const schema = joi.object().keys({
    name: joi.string().optional()
})

module.exports = (db) => async function (req, res) {
    if (isNaN(parseInt(req.params.groupId, 10))) {
        req.transaction.logger.info('Group ID must be an integer');
        throw res.boom.badRequest('Group ID must be an integer');
    }
    const groupId = parseInt(req.params.groupId, 10);

    req.transaction.logger.info('Validating schema');
    const validation = joi.validate(req.body, schema);
    if (validation.error) {
        req.transaction.logger.info('Schema validation error', {error : validation.error});
        return res.boom.badRequest(validation.error);
    }
    
    req.transaction.logger.info("Invoking policies");
    const allowed = policy.filterUpdate(req.transaction);
    if(!allowed) {
        req.transaction.logger.info("Policies refused")
        return res.boom.unauthorized();
    }


    req.transaction.logger.info('Finding group');
    const group = await db.Group.findByPk(groupId);

    req.body.name = req.body.name.toLowerCase();

    req.transaction.logger.info('Updating group');
    await group.update(req.body);

    req.transaction.logger.info('Returning updated group');
    return res.status(200).json(group);
};
