'use strict';

const db = require('../models');
const escape = require('escape-html');
const Storage = require('../repositories/Storage')


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


}

exports.upload_rev = (req, res) => {

    // Escape req.body strings
    for (let prop in req.body) {
        if (req.body && req.body.hasOwnProperty(prop) && typeof(req.body[prop]) === "string") {
            req.body[prop] = escape(req.body[prop]);
        }
    }

    // Find the file in database and add new data
    return db.File.findOne({where: {id: req.params.fileId}})
        .then(file => file.addData(req.body, req.file.path));


}

exports.upload_new = (req, res) => {

    if (!req.file) {
        return res.send(400);
    }

    // Escape req.body strings
    for (let prop in req.body) {
        if (req.body && Object.prototype.hasOwnProperty.call(req.body, prop) && typeof(req.body[prop]) === "string") {
            req.body[prop] = escape(req.body[prop]);
        }
    }

    // Create the file and its data
    return Storage.createNewFile(req.body, req.file.path)
        .then(() => res.statusCode(200))
        .then(() => res.json({}))

        // Send error to client, if any
        .catch(err => res.json(err))
}