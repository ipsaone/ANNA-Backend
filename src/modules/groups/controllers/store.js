'use strict';

let policy = require("../group_policy");
const joi = require('joi');

const schema = joi.object().keys({
    name: joi.string()
})

module.exports = (db) => async function (req, res) {
    if (typeof req.body.name !== 'string') {
        req.transaction.logger.info('Bad request, group name not a string');
        throw res.boom.badRequest('Group name must be a string');
    }
    req.body.name = req.body.name.toLowerCase();

    req.transaction.logger.info('Validating schema');
    const validation = joi.validate(req.body, schema);
    if (validation.error) {
        req.transaction.logger.info('Schema validation error', {error : validation.error});
        return res.boom.badRequest(validation.error);
    }

    req.transaction.logger.info("Invoking policies");
    const allowed = policy.filterStore(req.transaction);
    if(!allowed) {
        req.transaction.logger.info("Policies refused");
        return res.boom.unauthorized();
    }

    req.transaction.logger.info('Creating group');
    const group = await db.Group.create(req.body);

    req.transaction.logger.info('Returning new group');
    return res.status(201).json(group);
};
