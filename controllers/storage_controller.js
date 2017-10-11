'use strict';

const Storage = require('../repositories/Storage');

exports.index = function (req, res) {
    if (req.query.download && req.query.download === 'true')
        Storage.getFileForDownload(req.params[0])
            .then(file => {
                res.download(file.path);
            })
            .catch(err => {
                res.json(err);
            });
    else
        Storage.getObject(req.params[0])
            .then(object => {
                res.json(object);
            })
            .catch(err => {
                res.json(err);
            });
};

exports.store = function (req, res) {
    if (req.query && req.query.type === 'directory') {
        Storage.createFolder(req.body.path, req.body.name)
            .then(() => {
                res.json({});
            })
            .catch(err => {
                res.json(err.message);
            });
    }
    else if (req.query && req.query.type === 'file') {
        Storage.saveDataFile(req.body.path, req.body.name, req.body.ownerId)
            .then(data => {
                res.json(data);
            })
            .catch(err => {
                res.json(err.message);
            });
    }
    else
        res.json({message: 'Unknown type.'});
};

exports.put = function (req, res) {
    if (!req.file)
        return res.json({message: 'No valid files.'});
    else {
        Storage.saveFile(req.params[0], req.file)
            .then(file => {
                res.json(file);
            })
            .catch(err => {
                res.json(err.message);
            });
    }
};

exports.update = function (req, res) {

};

exports.delete = function (req, res) {
    if (req.query && req.query.type === 'directory') {
        Storage.deleteFolder(req.body.path)
            .then(() => {
                res.json({});
            })
            .catch(err => {
                res.json(err);
            });
    }
    else if (req.query && req.query.type === 'file') {
        Storage.deleteFile(req.body.id)
            .then(() => {
                res.json({});
            })
            .catch(err => {
                res.json(err);
            });
    }
    else
        res.json({message: 'Unknown type.'});
};