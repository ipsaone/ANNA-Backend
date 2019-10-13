'use strict';

const policy = require('../storage_policy');
const winston = require('winston');
const joi = require('joi');

const schema = joi.object().keys({
    dirId: joi.number().integer().positive().required(),
    groupId: joi.number().integer().positive(),
    isDir: joi.boolean(),
    serialNbr: joi.string(),
    fileId: joi.number().integer().positive(),
    ownerId: joi.number().integer().positive(),
    name: joi.string(),
    ownerRead : joi.boolean(),
    ownerWrite: joi.boolean(),
    groupRead: joi.boolean(),
    groupWrite: joi.boolean(),
    allRead: joi.boolean(),
    allWrite: joi.boolean(),
    
});


module.exports = (db) => async (req, res) => {

    // Needed because multer just modified it
    req.transaction.reqBody = req.body;
    req.transaction.file = req.file;

     // Validate user input
     req.transaction.logger.info('Validating schema');
     const validation = joi.validate(req.body, schema);
     if (validation.error) {
         req.transaction.logger.info('Schema validation failed');
         return res.boom.badRequest(validation.error);
     }

    // Check folderId
    const dirId = parseInt(req.body.dirId, 10);

    // Create the file and its data
    req.transaction.logger.info('Checking upload policies');
    const allowed = await policy.filterUploadNew(req.transaction, dirId);
    if (!allowed) {
        req.transaction.logger.info('Upload refused by policies');
        throw res.boom.unauthorized();
    }
    req.transaction.logger.info('Upload policies accepted request');

    req.transaction.filePath = '';
    if (req.file) {
        req.transaction.logger.info('Reading file path');
        req.transaction.filePath = req.file.path;
    }

    req.transaction.logger.info('Creating file')
    const data = await db.File.createNew(req.transaction);


    req.transaction.logger.info('Sending created data', {data});
    return res.status(200).json(data);
};
