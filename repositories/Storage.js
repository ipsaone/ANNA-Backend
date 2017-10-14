'use strict';

const fs = require('fs');
const _path = require('path');
const mime = require('mime-types');
const db = require('../models');
const config = require('../config/config');
const mv = require('mv');

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

    static checkRoot() {
        return new Promise((resolve, reject) => {
            fs.access(Storage.root, err => {
                if (err) {
                    fs.mkdir(Storage.root, err => {
                        return reject(Error('Internal server error'));
                    })
                }

                resolve();
            })
        });
    }


    static createFolder(path, name) {
        return new Promise((resolve, reject) => {
            const complete_path = _path.join(Storage.root, path, name);
            
            Storage.checkRoot().then(() => {
                fs.access(complete_path, err => {
                    if (err) {
                        fs.mkdir(complete_path, err => {
                            if (err) {

                                return reject(Error('Failed to create folder'))
                            }

                            return resolve();
                        });
                    }

                    else {
                        return reject(Error('Folder already exists.'));
                    }
                    
                })
            })
            
                
        });
    }


    static saveDataFile(path, name, ownerId) {
        return new Promise((resolve, reject) => {
            const complete_path = _path.join(Storage.root, path, name);

            fs.access(_path.join(complete_path, name), err => {
                if (err) {
                    db.File.create({path: complete_path, ownerId: ownerId, groupId: 1}) // TODO
                        .then(fileData => {
                            return resolve({url: Storage.url + path, method: 'PUT'});
                        })
                        .catch(err => {
                            return reject(err);
                        });
                } else {

                    return reject(Error('File already exists.'));
                }
            });
        });
    }


    static saveFile(path, file) {
        return new Promise((resolve, reject) => {
            path = _path.join(Storage.root, path, file.originalname);

            db.File.count({where: {path: path}})
                .then(count => {
                    if (count !== 0) {
                        mv(file.path, path, err => {
                            if (err) {
                                return reject(err);
                            }
                            else {
                                return resolve({success: true});
                            }
                        });
                    }
                    else {
                        return reject(Error('File is not in the database.'));
                    }
                })
                .catch(err => {
                    return reject(err);
                });
        });
    }


    static deleteFolder(path) {
        return new Promise((resolve, reject) => {
            fs.rmdir(_path.join(Storage.root, path), err => {
                if (err)
                    return reject(err);
                else
                    return resolve();
            });
        });
    }

    static deleteFile(id) {
        return db.File.getOne({where: {id: id}})
            .then(file => {
                fs.unlink(file.path);
            });
    }


    /* PRIVATES METHODS */

    static _getDirectoryTree(url) {
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

        return Promise.all(promises).then((res) => {
            dir.children = res;
            return dir;
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
