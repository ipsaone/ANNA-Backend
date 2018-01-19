'use strict';

// Const db = require.main.require('./models');
const joi = require('joi');

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


module.exports = (req, res) => {

    // Validate user input
    const validation = joi.validate(req.body, schema);

    if (validation.error) {
        return res.boom.badRequest(validation.error);
    }

    // Find keyword in data
    /*
     * If : not include previous data
     * Get corresponding files
     */
    // Filter where ID is not the most recent

    return true;
};

