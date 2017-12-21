'use strict';

const db = require('../models');
const escape = require('escape-html');
const Storage = require('../repositories/Storage');

const getChildrenData = (req, res, folderId) =>
    db.File.findAll() // Get all files

        // Check if file exists
        .then((files) => {
            if (files.map((item) => item.id).includes(folderId)) {
                return files;
            }
            throw res.boom.notFound();

        })

    // Get data corresponding to the files
        .then((files) => files.map((thisFile) => thisFile.getData()
            .then((data) => {
                data.isDir = thisFile.isDir;

                return data;
            })
            .catch((err) => {
                console.log(`[badImplementation] No data corresponding to file #${thisFile.id}`, err);

                return {};
            })))
        .then((data) => Promise.all(data))

    // Get each one in the folder, exclude root folder
        .then((data) => data.filter((item) => item.dirId === folderId))
        .then((data) => data.filter((item) => item.fileId !== 1));


/**
 *
 * Download a file or its metadata
 *
 * @param {Object} req - the user request
 * @param {Object} res - the response to be sent
 * @param {Object} handle - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.download = (req, res, handle) => {
    if (typeof req.params.fileId !== 'number') {

        return handle(res.boom.badRequest());
    }

    // Revision parameter, to get an older version
    let rev = 0;

    if (req.query.revision && parseInt(req.query.revision, 10)) {
        rev = req.query.revision;
    }

    // Download parameter, to get file metadata or contents
    const dl = req.query.download && req.query.download === 'true';

    // Find the file in database
    const findFile = db.File.findOne({where: {id: req.params.fileId}});

    // Send back the correct response, file or json
    const data = findFile.then((file) => {
        if (file) {
            return file.getData(rev);
        }
        throw res.boom.notFound();

    });

    if (dl) {
        return data.then(() => data.getPath(true))
            .then((path) => res.download(path))
            .catch((err) => handle(err));
    }

    return data.then((contents) => res.json(contents))
        .catch((err) => handle(err));


    /*
     * Had to comment and distribute the following line
     * data.catch((err) => handle(err));
     * to avoir eslint error
     */
};

/**
 *
 * Upload a new revision for an existing file
 *
 * @param {Object} req - the user request
 * @param {Object} res - the response to be sent
 * @param {Object} handle - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.uploadRev = (req, res, handle) => {
    if (typeof req.params.fileId !== 'number') {

        return handle(res.boom.badRequest());
    }

    // Escape req.body strings
    for (const key in req.body) {
        if (Object.prototype.hasOwnProperty.call(req.body, key) && typeof req.body.key === 'string') {
            req.body.key = escape(req.body.key);
        }
    }

    // Find the file in database and add new data
    return db.File.findOne({where: {id: req.params.fileId}})
        .then((file) => {
            console.log(req.file);

            return file.addData(req.body, req.file.path);
        })
        .catch((err) => handle(err));


};

/**
 *
 * Upload a new file
 *
 * @param {Object} req - the user request
 * @param {Object} res - the response to be sent
 * @param {Object} handle - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.uploadNew = (req, res, handle) => {
    if (!req.file) {
        throw res.boom.badRequest();
    }

    // Escape req.body strings
    for (const key in req.body) {
        if (Object.prototype.hasOwnProperty.call(req.body, key) && typeof req.body.key === 'string') {
            req.body.key = escape(req.body.key);
        }
    }

    // Create the file and its data
    return Storage.createNewFile(req.body, req.file.path)
        .then(() => res.status(204))
        .catch((err) => handle(err));
};

/**
 *
 * List contents of a folder
 *
 * @param {Object} req - the user request
 * @param {Object} res - the response to be sent
 * @param {Object} handle - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.list = (req, res, handle) => {
    // Fail if the folder isn't defined
    if (!req.params.folderId || !parseInt(req.params.folderId, 10)) {
        throw res.boom.badRequest();
    }

    const file = db.File;

    if (req.query.filesOnly) {
        file.scope('files');
    } else if (req.query.foldersOnly) {
        file.scope('folders');
    }

    const folderId = parseInt(req.params.folderId, 10);

    const childrenData = getChildrenData(req, res, folderId);
    const folderFile = db.File.findOne({where: {id: folderId}});
    const folderData = folderFile.then((thisFile) => thisFile.getData());

    return Promise.all([
        folderFile,
        folderData,
        childrenData
    ])
        .then((results) => {
            const response = results[1];

            response.isDir = results[0].isDir;
            response.children = results[2];

            return res.status(200).json(response);
        })
        .catch((err) => handle(err));

};

/**
 *
 * Deletes a file or folder
 *
 * @param {Object} req - the user request
 * @param {Object} res - the response to be sent
 * @param {Object} handle - the error handling function
 *
 * @returns {Object} promise
 *
 */
exports.delete = (req, res, handle) => {
    if (typeof req.params.fileId !== 'number') {

        throw res.boom.badRequest();
    }

    return db.Data.destroy({where: {fileId: req.params.fileId}})
        .then(() => db.File.destroy({where: {id: req.params.fileId}}))
        .then(() => res.status(204).send())
        .catch((err) => handle(err));
};
