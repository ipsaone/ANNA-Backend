'use strict';

const policy = require('../storage_policy');
const winston = require('winston');
const joi = require('joi');

const schema = joi.object().keys({
    dirId: joi.number().integer().positive().required(),
    groupId: joi.number().integer().positive().optional(),
    isDir: joi.boolean().optional(),
    serialNbr: joi.string().allow('').optional(),
    fileId: joi.number().integer().positive().optional(),
    ownerId: joi.number().integer().positive().optional(),
    name: joi.string().min(1).required(),
    ownerRead : joi.boolean().optional(),
    ownerWrite: joi.boolean().optional(),
    groupRead: joi.boolean().optional(),
    groupWrite: joi.boolean().optional(),
    allRead: joi.boolean().optional(),
    allWrite: joi.boolean().optional(),
    
});


module.exports = (db) => async (req, res) => {

    // Needed because multer just modified it
    req.transaction.reqBody = req.body;
    req.transaction.file = req.file;

     // Validate user input
     req.transaction.logger.info('Validating schema');
     const validation = schema.validate(req.body);
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
    const data = await db.File.createNew(req.transaction, req.body);


    req.transaction.logger.info('Sending created data', {data});
    return res.status(200).json(data);
};
