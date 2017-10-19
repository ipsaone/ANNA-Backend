'use strict';

const db = require('../models');

exports.index = function (req, res) {
    if (req.query.revision && parseInt(req.query.revision)) {
        if (req.query.download && req.query.download === 'true')
            db.File.findOne({where: {id: req.params.fileId}})
                .then(file => file.getPath(req.query.revision, true))
                .then(path => res.download(path));
        else
            db.File.findOne({where: {id: req.params.fileId}})
                .then(file => file.getData(req.query.revision))
                .then(data => {
                    res.statusCode = 200;
                    res.json(data);
                });
    }
};