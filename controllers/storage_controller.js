'use strict';

const fs = require('fs');
const Storage = require('../repositories/Storage');

exports.index = function (req, res) {
    Storage.getObject(req.params[0], (err, obj) => {
        if (err) res.json(err);
        else res.json(obj);
    });
};

exports.store = function (req, res) {
    res.json({message: 'Store the file'});
};