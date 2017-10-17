'use strict';

require('dotenv').config();

const fs = require('fs');
const _path = require('path');
const mime = require('mime-types');
const db = require('../models');
const config = require('../config/config');
const mv = require('mv');
const mmm = require('mmmagic');

const Magic = mmm.Magic;
let magic = new Magic(mmm.MAGIC_MIME_TYPE);

class Storage {
    static get root() {
        return _path.join(__dirname, '..', config.storage.folder);
    }

    static get baseUrl() {
        const conf = process.env.DEV ? config.env.dev : config.env.prod;
        return 'https://' + conf.host + ':' + conf.port + '/storage';
    }


    static getInstanceUrl(revOffset = 0) {
        return new Promise((accept, reject) => {
            let url = '/storage/files/';
            url += this.id;
            url += '?revision=';
            url += revOffset;

            return accept(url);
        });
    }

    static getInstancePath(revOffset = 0, full = false,) {
        return this.getData(revOffset).then(data => {
            let path = '';
            path += (full) ? Storage.root : '';
            path += '/';
            path += this.id;
            path += '/';
            path += data.id;
            path += '-';
            path += this.name;

            return newPromise((accept, reject) => {
                fs.access(path, function () {
                    if (err) {
                        return reject(err);
                    }
                    else {
                        return accept(path);
                    }
                });
            });


        });


    }

    static getInstanceDirTree() {
        return this.getData().then(data => {
            if (data.dirId === 0) {
                return [];
            }
            else {
                return db.File.findById(data.dirId).then(file => {
                    return file.getDirTree().then(tree => {
                        return tree.concat(this.name);
                    });
                });
            }
        });
    }

    static getInstanceData(offset = 0) {
        return db.Data.findAll({
            limit: 1,
            offset: offset,
            where: {fileId: fileId},
            order: [['createdAt DESC']]
        }).then(data => {
            console.log('data found :', data);
            return data[0];
        });

    }

    static _computeInstanceType() {
        return new Promise((accept, reject) => {
            return this.getData().then(data => {
                if (data.isDir) {
                    return accept('Directory');
                } else {
                    this.getPath().then(path => {
                        magic.detectFile(path, function (err, res) {
                            if (err) {
                                return reject(err);
                            }
                            else {
                                return accept(res);
                            }
                        });
                    });
                }
            });
        });
    }


    static _computeInstanceSize() {
        this.getData().then(data => {
            if (data.isDir()) {
                db.File.findAll({where: {dirId: fileId}}).then(files => {

                    // Compute all sizes in an array
                    Promise.all(files.map(file => file._computeSize())).then(sizes => {

                        // Return the sum of the sizes
                        return sizes.reduce((a, b) => a + b, 0);
                    });
                });
            } else {
                return new Promise((accept, reject) => {
                    db.File.findOne({where: {id: fileId}}).then(file => {
                        file.getPath().then(path => {
                            fs.stat(path, (err, res) => {
                                if (err) {
                                    return reject(err);
                                }
                                else {
                                    return accept(res.size);
                                }
                            });
                        });
                    });
                });
            }
        });
    }


}

module.exports = Storage;
