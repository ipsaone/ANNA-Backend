'use strict';

let policy = require("../group_policy");
const joi = require('joi');

const schema = joi.object().keys({})

module.exports = (db) => async function (req, res) {
    req.transaction.logger.debug('Invoking group show controller')
    const groupId = parseInt(req.params.groupId, 10);

    req.transaction.logger.info('Validating schema');
    const validation = joi.validate(req.body, schema);
    if (validation.error) {
        req.transaction.logger.info('Schema validation error', {error : validation.error});
        return res.boom.badRequest(validation.error);
    }

    req.transaction.logger.info("Invoking policies");
    const allowed = policy.filterShow(req.transaction);
    if(!allowed) {
        req.transaction.logger.info("Policies refused");
        return res.boom.unauthorized();
    }

    

    req.transaction.logger.info('Finding group');
    const group = await db.Group.findOne({
        where: {id: groupId},
        include: ['users']
    });

    if (!group) {
        req.transaction.logger.info('Group not found');
        throw res.boom.notFound();
    }

    req.transaction.logger.info('Group found, sending response');
    return res.status(200).json(group);
};
