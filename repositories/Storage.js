'use strict';

const fs = require('fs');
const config = require('../config/config');
const _path = require('path');

class Storage {
    static get root() {
        return _path.join(__dirname, '..', config.storage.folder);
    }

    static getObject(path) {
        const type = this._guessType(path);

        console.log(type);
    }


    static _guessType(path) {
        path = _path.join(this.root, path); // Create the complete file path

        const stats = fs.statSync(path);

        if(stats.isDirectory())
            return 'directory';
        else if(stats.isFile())
            return 'file';
        else
            return Error('Unknown type');
    }
}

// TESTS
Storage.getObject('bar/');