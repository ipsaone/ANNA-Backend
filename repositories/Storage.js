'use strict';

const fs = require('fs');
const _path = require('path');
const mime = require('mime-types');
const db = require('../models');
const config = require('../config/config');

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

    /**
     * Returns an object describing the request.
     * GET /bar/foo.txt returns a file object
     * GET /bar/foo/ returns a folder object (with all its children)
     *
     * @param url example : /bar/foo.txt or /bar/foo/
     */
    static getObject(url) {
        return new Promise((resolve, reject) => {
            Storage._getStats(url)
                .then(stats => {
                    if (stats.isDirectory())
                        Storage._getDirectoryTree(url)
                            .then(tree => {
                                return resolve(tree);
                            });
                    else if (stats.isFile())
                        Storage._getFile(url, stats)
                            .then(file => {
                                return resolve(file);
                            })
                            .catch(err => {
                                return reject(err);
                            });
                    else
                        reject(Error('Storage.getObject error, not a file or a directory.'));
                })
                .catch(err => reject(err));
        });
    };


    static getFileForDownload(url) {
        return new Promise((resolve, reject) => {
            const path = _path.join(Storage.root, url);

            fs.stat(path, (err, stats) => {
                if (err) return reject(err);

                if (stats.isFile())
                    return resolve({path: path});
                else
                    return reject(Error('Not a file'));
            });
        });
    };


    static _getDirectoryTree(url) {
        return new Promise(resolve => {
            let dir = Storage._getDirectory(url);
            const dirData = fs.readdirSync(dir.path);

            let promises = [];

            if (dirData !== null) {
                promises = dirData.map(child => {
                    const child_url = url + '/' + child;

                    return Storage._getStats(child_url)
                        .then(stats => {
                            if (stats.isDirectory())
                                return Storage._getDirectory(child_url);
                            else
                                return Storage._getFile(child_url, stats);
                        });
                });
            }

            Promise.all(promises).then((res) => {
                dir.children = res;
                return resolve(dir);
            });
        });
    };


    static _getFile(url, stats) {
        const path = _path.join(Storage.root, url);
        const path_parsed = _path.parse(path);

        return db.File.findOne({where: {path: path}, include: ['owner', 'group']})
            .then(file => {
                file.type = 'file';
                file.url = Storage.url + url;
                file.base = path_parsed.base;
                file.name = path_parsed.name;
                file.ext = path_parsed.ext;
                file.size = stats.size;
                file.mime = mime.lookup(path_parsed.ext);

                return file;
            })
            .catch(err => Error(`File '${path}' is not registered in the database.`));
    };


    static _getDirectory(url) {
        const path = _path.join(Storage.root, url);

        return {
            type: 'directory',
            name: _path.basename(path),
            url: Storage.url + '/' + url,
            path: path,
        };
    };


    static _getStats(url) {
        return new Promise((resolve, reject) => {
            fs.stat(_path.join(Storage.root, url), (err, stats) => {
                if (err) return reject(err);

                if (stats.isDirectory() || stats.isFile())
                    return resolve(stats);
                else
                    return reject(Error('Unknown type'));
            });
        });
    };
}

module.exports = Storage;
