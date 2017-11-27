'use strict';

const db = require('../models');
const escape = require('escape-html');
const Storage = require('../repositories/Storage');
const boom = require('boom');


exports.download = (req, res, handle) => {

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
        data.then(() => data.getPath(true)).
            then((path) => res.download(path));
    } else {
        data.then((contents) => res.json(contents));
    }

    data.catch((err) => handle(err));
};

exports.uploadRev = (req, res, handle) => {
    // Escape req.body strings
    for (const prop in req.body) {
        if (req.body && Object.prototype.hasOwnProperty.call(req.body, prop) && typeof req.body[prop] === 'string') {
            req.body[prop] = escape(req.body[prop]);
        }
    }

    // Find the file in database and add new data
    return db.File.findOne({where: {id: req.params.fileId}}).
        then((file) => {
            console.log(req.file);

            return file.addData(req.body, req.file.path);
        }).
        catch((err) => handle(err));


};

exports.uploadNew = (req, res, handle) => {
    if (!req.file) {
        throw res.boom.badRequest();
    }

    // Escape req.body strings
    for (const prop in req.body) {
        if (req.body && Object.prototype.hasOwnProperty.call(req.body, prop) && typeof req.body[prop] === 'string') {
            req.body[prop] = escape(req.body[prop]);
        }
    }

    // Create the file and its data
    return Storage.createNewFile(req.body, req.file.path).
        then(() => res.status(204)).
        catch((err) => handle(err));
};

exports.list = (req, res, handle) => {

    // Fail if the folder isn't defined
    if (!req.params.folderId || !parseInt(req.params.folderId, 10)) {
        return handle(boom.badRequest());
    }

    const file = db.File;

    if (req.query.filesOnly) {
        file.scope('files');
    } else if (req.query.foldersOnly) {
        file.scope('folders');
    }

    const folderId = parseInt(req.params.folderId, 10);

    const childrenData =
        file.findAll(). // Get all files

        // Check if file exists
            then((files) => {
                if (files.map((item) => item.id).includes(folderId)) {
                    return files;
                }
                throw res.boom.notFound();

            }).

            // Get data corresponding to the files
            then((files) => files.map((file) => file.getData().
                then((data) => {
                    data.isDir = file.isDir;

                    return data;
                }).
                catch((err) => {
                    console.log(`[badImplementation] No data corresponding to file #${file.id}`);

                    return {};
                }))).
            then((data) => Promise.all(data)).

            // Get each one in the folder, exclude root folder
            then((data) => data.filter((item) => item.dirId === folderId)).
            then((data) => data.filter((item) => item.fileId !== 1));

    const folderFile = db.File.findOne({where: {id: folderId}});
    const filderData = folder_file.then((file) => file.getData());

    return Promise.all([
        folderFile,
        folderData,
        childrenData
    ]).
        then((results) => {
            const folderData = results[1];

            folderData.isDir = results[0].isDir;
            folderData.children = results[2];

            res.status(200).json(folderData);
        }).
        catch((err) => handle(err));

};

exports.delete = (req, res, handle) => {
    db.Data.destroy({where: {fileId: req.params.fileId}}).
        catch((err) => handle(err));

    db.File.destroy({where: {id: req.params.fileId}}).
        then(() => res.status(204).send()).
        catch((err) => handle(err));
};
