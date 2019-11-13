'use strict';

const joi = require('joi');
const policy = require('../storage_policy');
const search = require('../repository/search');

const includeOptions = ['previous_data', 'serialNbr', 'name'];

const schema = joi.object().keys({
    keyword: joi.string().required(),
    upperFolder: joi.number().integer(),
    include: joi.array().items(joi.string().valid(includeOptions)).optional()

});

module.exports = (db) => async (req, res) => {

    // Validate user input
    req.transaction.logger.debug('Validating request')
    const validation = joi.validate(req.body, schema);
    if (validation.error) {
        req.transaction.logger.info('Request failed validation', {body: req.body, error: validation.error});
        return res.boom.badRequest(validation.error);
    }

    req.transaction.logger.info('Starting search');
    let matchingData = await search(req.transaction);

    req.transaction.logger.info('Invoking policies');
    let results = await policy.filterSearch(req.transaction, matchingData);

    req.transaction.logger.debug('Returning found data', {data: results.map(e => e.toJSON())});
    return res.status(200).json(results.map(e => e.toJSON()));

};

