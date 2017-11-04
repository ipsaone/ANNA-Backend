'use strict';

const db = require('../models');
const escape = require('escape-html');
const Storage = require('../repositories/Storage');


exports.download = (req, res) => {

    // Revision parameter, to get an older version
    let rev = 0;
    if (req.query.revision && parseInt(req.query.revision)) {
        rev = req.query.revision;
    }

    // Download parameter, to get file metadata or contents
    let dl = false;
    if (req.query.download && req.query.download === 'true') {
        dl = true;
    }

    // Find the file in database
    let findFile = db.File.findOne({where: {id: req.params.fileId}});

    // Send back the correct response, file or json
    let data = findFile.then(file => file.getData(rev));
    if (dl)
        data.then(path => getPath(true))
            .then(path => res.download(path));
    else
        data.then(data => res.json(data));


};

exports.upload_rev = (req, res) => {

    // Escape req.body strings
    for (let prop in req.body) {
        if (req.body && req.body.hasOwnProperty(prop) && typeof(req.body[prop]) === 'string') {
            req.body[prop] = escape(req.body[prop]);
        }
    }

    // Find the file in database and add new data
    return db.File.findOne({where: {id: req.params.fileId}})
        .then(file => file.addData(req.body, req.file.path));


};

exports.upload_new = (req, res) => {

    if (!req.file) {
        return res.sendStatus(400);
    }

    // Escape req.body strings
    for (let prop in req.body) {
        if (req.body && Object.prototype.hasOwnProperty.call(req.body, prop) && typeof(req.body[prop]) === 'string') {
            req.body[prop] = escape(req.body[prop]);
        }
    }

    // Create the file and its data
    return Storage.createNewFile(req.body, req.file.path)
        .then(() => res.sendStatus(200))
        .then(() => res.json({}))

        // Send error to client, if any
        .catch(err => res.json(err));
};

exports.list = (req, res) => {

    // Fail if the folder isn't defined
    if (!req.params.folderId || !parseInt(req.params.folderId)) {
        return res.sendStatus(400);
    }

    let folderId = parseInt(req.params.folderId);

    let children_data =
        db.File.findAll()    // Get all files

        // Check if file exists
            .then(files => {
                if (!files.map(item => item.id).includes(folderId)) {
                    res.send(404);
                    return Promise.reject('Folder doesn\'t exist'); // TODO : real error type ?
                } else {
                    return files;
                }
            })

            // Get data corresponding to the files
            .then(files => files.map(file => {
                return {isDir: file.isDir, dataPromise: file.getData()};
            }))
            .then(data => data.map(item => item.dataPromise.then(data => {
                data.isDir = item.isDir;
                return data;
            })))
            .then(data => Promise.all(data))

            // Get each one in the folder, exclude root folder
            .then(data => data.filter(item => (item.dirId === folderId)))
            .then(data => data.filter(item => (item.fileId !== 1)))


            // Return the data or an error, if needed
            .catch(err => {
                console.log(err);

                if (!res.headersSent) {
                    return res.send(500);
                }

            });

    let folder_file = db.File.findOne({where: {id: folderId}});
    let folder_data = folder_file.then(file => file.getData());

    return Promise.all([folder_file, folder_data, children_data])
        .then(results => {
            let folder_data = results[1];
            folder_data.isDir = results[0].isDir;
            folder_data.children = results[2];

            res.json(folder_data);
        });

};