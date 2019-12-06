'use strict';

/**
 * @api {post} /storage Upload a new file
 * @apiName uploadNew
 * @apiGroup Storage
 * 
 * @apiParam {integer} dirId The file ID of the parent directory
 * @apiParam {integer} groupId The group ID of the owner group
 * @apiParam {boolean} [isDir] Whether the created entry is a directory or a file
 * @apiParam {string} [serialNbr] The file's serial number
 * @apiParam {integer} [ownerId] The owner's ID. Defaults to current user.
 * @apiParam {string} name The file's name
 * @apiParam {boolean} [ownerRead] Whether the owner can read the file. Defaults to false.
 * @apiParam {boolean} [ownerWrite] Whether the owner can write the file. Defaults to false.
 * @apiParam {boolean} [groupRead] Whether the owner group can read the file. Defaults to false.
 * @apiParam {boolean} [ownerWrite] Whether the owner group can write the file. Defaults to false.
 * @apiParam {boolean} [allRead] Whether the other users can read the file. Defaults to false.
 * @apiParam {boolean} [allWrite] Whether the other users can write the file. Defaults to false.
 * @apiParam {boolean} [hidden] Whether the file is hidden. Defaults to false.
 * 
 * @apiSuccess {object} data The file data information
 */

const policy = require('../storage_policy');
const winston = require('winston');
const joi = require('joi');

const schema = joi.object().keys({
    dirId: joi.number().integer().positive().required(),
    groupId: joi.number().integer().positive().optional(),
    isDir: joi.boolean().optional(),
    serialNbr: joi.string().allow('').optional(),
    ownerId: joi.number().integer().positive().optional(),
    name: joi.string().min(1).required(),
    ownerRead : joi.boolean().optional(),
    ownerWrite: joi.boolean().optional(),
    groupRead: joi.boolean().optional(),
    groupWrite: joi.boolean().optional(),
    allRead: joi.boolean().optional(),
    allWrite: joi.boolean().optional(),
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
