'use strict';

const joi = require('joi');
const async = require('async');
const util = require('util');

const includeOptions = ['previous_data'];
const sortOptions = [
    'date_new',
    'date_old'
];

const schema = joi.object().keys({
    keyword: joi.string().required(),
    upperFolder: joi.number().integer(),
    include: joi.array().items(joi.string().valid(includeOptions)),
    sortBy: joi.array().items(joi.string().valid(sortOptions))

});

/**
 * Search a keyword in all data/files
 */


module.exports = (db) => async (req, res) => {

    // Validate user input
    const validation = joi.validate(req.body, schema);

    if (validation.error) {
        return res.boom.badRequest(validation.error);
    }

    // Find keyword in data
    const options = {where: {name: {[db.Sequelize.Op.like]: `%${req.body.keyword}%`}}};
    const matchingData = await db.Data.findAll(options);

    // If all data are requested, send everything we find
    if (req.body.include && 'previous_data' in req.body.include) {
        return matchingData;
    }

    // Otherwise, filter data
    const filterPromise = util.promisify(async.filter);
    const filteredData = await filterPromise(matchingData, async.asyncify(async (el) => {

        // Find the file corresponding to data
        const file = await db.File.findById(el.fileId);

        if (!file) {
            return false;
        }

        // Find the most recent data from the file
        const lastData = await file.getData(db);

        if (lastData.id !== el.id) {
            return false;
        }

        return true;

    }));

    return res.status(200).json(filteredData);

};

