'use strict';

const fs = require('fs');
const config = require('../config/config');
const _path = require('path');

class Storage {
    static get root() {
        return _path.join(__dirname, '..', config.storage.folder);
    }

    static getObject(path, cb) {
        this._guessType(path, (err, type) => {
            if (err) return cb(err);

            if (type === 'directory') {
                return cb(null, 'directory');
            }
            else if (type === 'file') {
                return cb(null, this._getFile(path));
            }
            else {
                return cb(null, type);
            }
        });
    }

    static _getFile(path) {
        return {
            type: 'file',
            path: _path.join(this.root, path)
        };
    }


    static _guessType(path, cb) {
        fs.stat(_path.join(this.root, path), (err, stats) => {
            if (err) return cb(err);

            if (stats.isDirectory())
                return cb(null, 'directory');
            else if (stats.isFile()) {
                return cb(null, 'file');
            }
            else
                return cb(null, 'ETYPE');
        });
    }
}

// TESTS
Storage.getObject('bar/foo.txt', (err, result) => {
    if (err) console.log(err);
    else console.log(result);
});
