'use strict';

const joi = require('joi');
const async = require('async');
const util = require('util');
const winston = require('winston');

const includeOptions = ['previous_data', 'serialNbr', 'name'];

const schema = joi.object().keys({
    keyword: joi.string().required(),
    upperFolder: joi.number().integer(),
    include: joi.array().items(joi.string().valid(includeOptions))

});

/**
 * Search a keyword in all data/files
 */


module.exports = (db) => async (req, res) => {

    // Validate user input
    winston.debug('Validating request')
    const validation = joi.validate(req.body, schema);
    if (validation.error) {
        winston.info('Request failed validation', {body: req.body, error: validation.error});
        return res.boom.badRequest(validation.error);
    }

    // Find keyword in data
    winston.debug('Parsing searches')
    const searches = [];
    if(req.body.include && req.body.include.includes('name')) {
        winston.debug('Adding name search option')
        searches.push({name: {[db.Sequelize.Op.like]: `%${req.body.keyword}%`}});
    }
    if(req.body.include && req.body.include.includes('serialNbr')) {
        winston.debug('Adding serialNbr search option');
        searches.push({serialNbr: {[db.Sequelize.Op.like]: `%${req.body.keyword}%`}});
    }
    const options = {[db.Sequelize.Op.or]: searches};
    winston.debug('Starting search', {options});
    const matchingData = await db.Data.findAll({where: options});

    // If all data are requested, send everything we find
    if (req.body.include && 'previous_data' in req.body.include) {
        winston.debug('Sending all found data');
        return matchingData;
    }

    // Otherwise, filter data
    winston.debug('Filtering data')
    const filterPromise = util.promisify(async.filter);
    const filteredData = await filterPromise(matchingData, async.asyncify(async (el) => {

        // Find the file corresponding to data
        winston.debug('finding file from data', {data: el.toJSON()})
        const file = await db.File.findByPk(el.fileId);
        if (!file) {
            winston.error('Couldn\t find file from data', {data: el.toJSON()})
            return false;
        }

        // Find the most recent data from the file
        winston.debug('Finding most recent data')
        const lastData = await file.getData(db);
        if (lastData.id !== el.id) {
            winston.error('Last data id doesn\'t match this data id', {lastData: lastData.toJSON(), thisData: el.toJSON()})
            return false;
        }

        return true;

    }));

    winston.info('Returning found data', {data: filteredData});
    return res.status(200).json(filteredData);

};

