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
    res.json({message: 'Store the file'});
};