'use strict';

const fs = require('fs');


exports.index = function (req, res) {
    const path = req.body.path;
    const intern_path = __dirname + '/../storage/' + path;

    // 1 - Check if it's a folder or a file and if it exists
    fs.stat(intern_path, (err, stats) => {
        if (err)
            res.json({message: `'${path}' doesn't exist.`, error: err});
        else {
            if (stats.isDirectory()) res.json({message: `'${path}' is a directory`});
            if (stats.isFile()) res.json({message: `'${path}' is a file`});
        }
    });

    // 3 - Return all information about it (select from the database)
};

exports.store = function (req, res) {
    res.json({message: 'Store the file'});
};