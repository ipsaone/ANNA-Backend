'use strict';

const joi = require('joi');
const async = require('async');
const util = require('util');
const policy = require('../storage_policy');
const winston = require('winston');

const includeOptions = ['previous_data', 'serialNbr', 'name'];

const schema = joi.object().keys({
    keyword: joi.string().required(),
    upperFolder: joi.number().integer(),
    include: joi.array().items(joi.string().valid(includeOptions))

});


module.exports = (db) => async (req, res) => {

    // Validate user input
    req.transaction.logger.debug('Validating request')
    const validation = joi.validate(req.body, schema);
    if (validation.error) {
        req.transaction.logger.info('Request failed validation', {body: req.body, error: validation.error});
        return res.boom.badRequest(validation.error);
    }

    // Find keyword in data
    req.transaction.logger.debug('Parsing searches')
    const searches = [];
    if(req.body.include && req.body.include.includes('name')) {
        req.transaction.logger.debug('Adding name search option')
        searches.push({name: {[db.Sequelize.Op.like]: `%${req.body.keyword}%`}});
    }
    if(req.body.include && req.body.include.includes('serialNbr')) {
        req.transaction.logger.debug('Adding serialNbr search option');
        searches.push({serialNbr: {[db.Sequelize.Op.like]: `%${req.body.keyword}%`}});
    }
    const options = {[db.Sequelize.Op.or]: searches};
    req.transaction.logger.debug('Starting search', {options});
    const matchingData = await db.Data.findAll({where: options});
    let filteredData;

    // If all data are requested, send everything we find
    if (req.body.include && 'previous_data' in req.body.include) {
        req.transaction.logger.debug('Sending all found data');
        filteredData = matchingData;
    } else {

        // Otherwise, filter data
        req.transaction.logger.debug('Filtering data')
        const filterPromise = util.promisify(async.filter);
        filteredData = await filterPromise(matchingData, async.asyncify(async (el) => {

            // Find the file corresponding to data
            req.transaction.logger.debug('finding file from data', {data: el.toJSON()})
            const file = await db.File.findByPk(el.fileId);
            if (!file) {
                req.transaction.logger.error('Couldn\t find file from data', {data: el.toJSON()})
                return false;
            }

            // Find the most recent data from the file
            req.transaction.logger.debug('Finding most recent data')
            const lastData = await file.getData(db);
            if (lastData.id !== el.id) {
                req.transaction.logger.debug('Last data id doesn\'t match this data id', {lastData: lastData.toJSON(), thisData: el.toJSON()})
                return false;
            }

            return true;

        }));
    }

    let results = await policy.filterSearch(req.transaction, filteredData);


    req.transaction.logger.debug('Returning found data', {data: results.map(e => e.toJSON())});
    return res.status(200).json(results.map(e => e.toJSON()));

};

