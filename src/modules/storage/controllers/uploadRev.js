'use strict';

/**
 * @api {post} /storage/:fileId Upload a file revision
 * @apiName uploadRev
 * @apiGroup Storage
 * 
 * @apiParam {integer} [dirId] The file ID of the parent directory
 * @apiParam {integer} [groupId] The group ID of the owner group
 * @apiParam {string} [serialNbr] The file's serial number
 * @apiParam {integer} [ownerId] The owner's ID. Defaults to current user.
 * @apiParam {string} [name] The file's name
 * @apiParam {boolean} [ownerRead] Whether the owner can read the file
 * @apiParam {boolean} [ownerWrite] Whether the owner can write the file
 * @apiParam {boolean} [groupRead] Whether the owner group can read the file
 * @apiParam {boolean} [ownerWrite] Whether the owner group can write the file
 * @apiParam {boolean} [allRead] Whether the other users can read the file
 * @apiParam {boolean} [allWrite] Whether the other users can write the file
 * @apiParamm {boolean} [hidden] Whether the file is hidden
 * 
 * @apiSuccess {object} data The file data information
 */


const policy = require('../storage_policy');
const winston = require('winston');
const joi = require('joi');

const schema = joi.object().keys({
    dirId: joi.number().integer().positive().optional(),
    groupId: joi.number().integer().positive().optional(),
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
    contents: joi.any().optional(),
    hidden: joi.boolean().optional()
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
