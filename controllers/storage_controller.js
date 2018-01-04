'use strict';

const db = require('../models');
const escape = require('escape-html');
const policy = require('../policies/storage_policy');

const getChildrenData = async (folderId) => {
    let files = await db.File.findAll();

    if (!files.map((item) => item.id).includes(folderId)) {
        files = [];
    }

    let data = await Promise.all(files.map(async (thisFile) => {
        const thisData = await thisFile.getData();

        thisData.isDir = thisFile.isDir;

        return thisData;
    }));


    data = data.filter((item) => item.dirId === folderId);
    data = data.filter((item) => item.fileId !== 1);

    return data;

};


/**
 *
 * Download a file or its metadata.
 *
 * @param {obj} req     - The user request.
 * @param {obj} res     - The response to be sent.
 * @param {obj} handle  - The error handling function.
 *
 * @returns {Object} Promise.
 *
 */
exports.download = async (req, res) => {
    if (isNaN(parseInt(req.params.fileId, 10))) {
        return res.boom.badRequest();
    }
    const fileId = parseInt(req.params.fileId, 10);

    // Revision parameter, to get an older version
    let rev = 0;

    if (isNaN(parseInt(req.query.revision, 10))) {
        rev = parseInt(req.query.revision, 10);
    }

    // Download parameter, to get file metadata or contents
    const dl = req.query.download && req.query.download === 'true';

    // Find the file in database
    const file = await db.File.findById(fileId);

    // Send back the correct response, file or json
    if (!file) {
        return res.boom.notFound();
    }

    const data = await file.getData(rev);

    if (dl) {
        const allowed = await policy.filterDownloadContents();

        if (!allowed) {
            return res.boom.unauthorized();
        }

        const path = await data.getPath(true);


        return res.download(path);
    }

    const allowed = await policy.filterDownloadMeta();

    if (!allowed) {
        throw res.boom.unauthorized();
    }

    return res.json(data);
};

/**
 *
 * Upload a new revision for an existing file.
 *
 * @param {obj} req     - The user request.
 * @param {obj} res     - The response to be sent.
 * @param {obj} handle  - The error handling function.
 * @todo for security, better escape req.body, like validating against a schema ?
 * @todo handle file contents upload !
 *
 * @returns {obj} Promise.
 *
 */
exports.uploadRev = async (req, res) => {
    if (isNaN(parseInt(req.params.fileId, 10))) {
        throw res.boom.badRequest();
    }
    const fileId = parseInt(req.params.fileId, 10);

    // Escape req.body strings
    Object.keys(req.body).map(function (key) {
        if (typeof req.body[key] === 'string') {
            req.body[key] = escape(req.body[key]);
        }

        return true;
    });

    // Find the file in database and add new data
    const allowed = await policy.filterUploadRev();

    if (!allowed) {
        throw res.boom.unauthorized();
    }

    const file = await db.File.findById(fileId);

    await file.addData(req.body, req.file.path);

    return res.status(200).json({});
};

/**
 *
 * Upload a new file.
 *
 * @param {Object} req - the user request
 * @param {Object} res - the response to be sent
 * @param {Object} handle - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.uploadNew = async (req, res) => {

    /*
     * ATTENTION : NO INPUT VALIDATION !
     * (Integer checking for dirId/groupId)
     */

    // Escape req.body strings
    req.body = Object.keys(req.body).map(function (key) {
        if (typeof req.body[key] === 'string') {
            req.body[key] = escape(req.body[key]);
        }

        return true;
    });

    // Create the file and its data
    const allowed = await policy.filterUploadNew(req.body.dirId, req.session.auth);

    if (!allowed) {
        throw res.boom.unauthorized();
    }

    let filePath = '';

    if (req.file) {
        filePath = req.file.path;
    }

    await db.File.createNew(req.body, filePath, req.session.auth, false);

    return res.status(204).json({});
};

/**
 *
 * List contents of a folder.
 *
 * @param {Object} req - the user request
 * @param {Object} res - the response to be sent
 * @param {Object} handle - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.list = async (req, res) => {
    // Fail if the folder isn't defined
    if (!req.params.folderId || isNaN(parseInt(req.params.folderId, 10))) {
        throw res.boom.badRequest();
    }
    const folderId = parseInt(req.params.folderId, 10);
    const file = db.File;

    if (req.query.filesOnly) {
        file.scope('files');
    } else if (req.query.foldersOnly) {
        file.scope('folders');
    }

    const childrenDataP = getChildrenData(folderId); // Start getting children data
    const folderFile = await db.File.findOne({ // Do things in the middle
        where: {id: folderId},
        rejectOnEmpty: true
    });
    const childrenData = await childrenDataP; // Wait to actually have them

    const authorized = policy.filterList(folderId, req.session.auth);

    if (!authorized) {
        throw res.boom.unauthorized();
    }


    const folderData = await folderFile.getData();

    const response = folderData;

    response.isDir = folderFile.isDir;
    response.children = childrenData;

    return res.status(200).json(response);
};

/**
 *
 * Deletes a file or folder.
 *
 * @param {Object} req - the user request
 * @param {Object} res - the response to be sent
 * @param {Object} handle - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.delete = async (req, res) => {
    if (isNaN(parseInt(req.params.fileId, 10))) {

        throw res.boom.badRequest();
    }
    const fileId = parseInt(req.params.fileId, 10);

    const authorized = policy.filterDelete();

    if (!authorized) {
        throw res.boom.unauthorized();
    }

    await db.Data.destroy({where: {fileId}});
    await db.File.destroy({where: {id: fileId}});

    return res.status(204).send();
};
