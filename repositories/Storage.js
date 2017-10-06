'use strict';

const fs = require('fs');
const config = require('../config/config');
const _path = require('path');

const mime = require('mime-types');

class Storage {
    static get root() {
        return _path.join(__dirname, '..', config.storage.folder);
    }

    static get url() {
        if (config.app.env === 'production')
            return 'https://' + config.env.prod.host + ':' + config.env.prod.port + '/storage';
        else
            return 'https://' + config.env.dev.host + ':' + config.env.dev.port + '/storage';
    }

    static getObject(url, cb) {
        url = url.replace(/\/$/, "");
        this._guessType(url, (err, type) => {
            if (err) return cb(err);

            if (type === 'directory') {
                return cb(null, this._getDirectoryTree(url));
            }
            else if (type === 'file') {
                return cb(null, this._getFile(url));
            }
            else {
                return cb(null, type);
            }
        });
    }

    static _getFile(url, stats) {
        const path = _path.join(this.root, url)
        const path_parsed = _path.parse(path);

        return {
            type: 'file',
            path: path,
            url: this.url + url,
            base: path_parsed.base,
            name: path_parsed.name,
            ext: path_parsed.ext,
            size: stats.size,
            mime: mime.lookup(path_parsed.ext),
            charset: mime.charset(path)
        };
    }

    static _getDirectory(url) {
        const path = _path.join(this.root, url);

        return {
            type: 'directory',
            name: _path.basename(path),
            url: this.url + url,
            path: path,
        }
    }


    static _getDirectoryTree(url) {
        let dir = this._getDirectory(url);

        const dirData = this._safeReadDirSync(dir.path);
        if (dirData === null) return null;

        dir.children = dirData.map(child => {
            const stats = fs.statSync(_path.join(dir.path, child));
            if (stats.isDirectory()) {
                return this._getDirectory(url + '/' + child);
            }
            else {
                return this._getFile(url + '/' + child, stats)
            }
        });

        return dir;
    }


    static _safeReadDirSync(path) {
        let dirData = {};
        try {
            dirData = fs.readdirSync(path);
        } catch (ex) {
            if (ex.code === 'EACCES') return null; //User does not have permissions, ignore directory
            else throw ex;
        }
        return dirData;
    }


    static _guessType(url, cb) {
        fs.stat(_path.join(this.root, url), (err, stats) => {
            if (err) return cb(err);

            if (stats.isDirectory())
                return cb(null, 'directory');
            else if (stats.isFile()) {
                return cb(null, 'file');
            }
            else
                return cb(Error('Unknown type'));
        });
    }
}

// TESTS
// Storage.getObject('/bar/', (err, result) => {
//     if (err) console.log(err);
//     else console.log(result);
// });
