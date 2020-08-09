'use strict';

const policy = require('../storage_policy');
const winston = require('winston');
const joi = require('joi');

const schema = joi.object().keys({
    dirId: joi.number().integer().positive().optional(),
    groupId: joi.number().integer().positive().optional(),
    isDir: joi.boolean().optional(),
    serialNbr: joi.string().optional().allow('').optional(),
    fileId: joi.number().integer().positive().optional(),
    ownerId: joi.number().integer().positive().optional(),
    name: joi.string().min(1).optional(),
    ownerRead : joi.boolean().optional(),
    ownerWrite: joi.boolean().optional(),
    groupRead: joi.boolean().optional(),
    groupWrite: joi.boolean().optional(),
    allRead: joi.boolean().optional(),
    allWrite: joi.boolean().optional(),
    contents: joi.any().optional()
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

    const fileId = parseInt(req.params.fileId, 10);

    // Find the file in database and add new data
    req.transaction.logger.debug('Checking policies');
    const allowed = await policy.filterUploadRev(req.transaction, fileId);
    if (!allowed) {
        req.transaction.logger.info('Upload (rev) refused by policies');
        throw res.boom.unauthorized();
    }

    req.transaction.logger.debug('Finding file and reading path')
    const file = await db.File.findByPk(fileId);
    if (req.file) {
        req.transaction.logger.debug('Reading file path');
        req.transaction.filePath = req.file.path;
    
    }


    try {
        req.transaction.logger.debug('adding data');
        let data = await file.addData(req.transaction);

        req.transaction.logger.info('Responding with new data');
        return res.status(200).json(data);
    } catch (e) {
        return res.boom.badRequest(e);
    }


};
