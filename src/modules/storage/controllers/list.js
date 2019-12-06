'use strict';

const policy = require('../storage_policy');
const getChildrenData = require('../repository/list');
const joi = require('joi');

const schema = joi.object().keys({});


/**
 *
 * List contents of a folder.
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 */

module.exports = (db) => async (req, res) => {
    const folderId = parseInt(req.params.folderId, 10);

     // Validate user input
     req.transaction.logger.info('Validating schema');
     const validation = joi.validate(req.body, schema);
     if (validation.error) {
         req.transaction.logger.info('Schema validation failed');
         return res.boom.badRequest(validation.error);
     }

    req.transaction.logger.debug('Finding requested file')
    let file = await db.File.findByPk(folderId);
    if(!file) {
        req.transaction.logger.debug('File not found', {folderId});
        return res.boom.badRequest('File not found');
    }

    req.transaction.logger.debug('Starting request for children data for folder', {folderId});
    const childrenDataP = getChildrenData(folderId, req.query, req.transaction);
    const folderFileP = db.File.findOne({
        where: {id: folderId},
        rejectOnEmpty: true
    });

    req.transaction.logger.debug('Checking policies')
    const authorized = await policy.filterList(req.transaction, folderId, req.session.auth);
    if (!authorized) {
        req.transaction.logger.info('Folder list denied by policies');
        return res.boom.unauthorized("folder list denied");
    }

    req.transaction.logger.debug('Waiting for children data');
    const folderFile = await folderFileP;
    const dirTreeP = folderFile.getDirTree(db);
    const folderData = await folderFile.getData(db);

    if(!folderData) {
        req.transaction.logger.error('could not find folder data', {folderFile : folderFile.toJSON()})
        return res.boom.internal();
    }

    req.transaction.logger.debug('Building response')
    const response = folderData.toJSON();
    response.isDir = folderFile.isDir;
    response.dirTree = await dirTreeP;
    response.children = await childrenDataP;

    req.transaction.logger.info('Sending folder list');
    return res.status(200).json(response);
};
