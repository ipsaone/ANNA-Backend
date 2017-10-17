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
let   magic = new Magic(mmm.MAGIC_MIME_TYPE);

class Storage {
    static get root() {
        return _path.join(__dirname, '..', config.storage.folder);
    }

    static get baseUrl() {
        let conf = process.env.DEV ? config.env.dev : config.env.prod;
        return 'https://' + conf.host + ':' + conf.port + '/storage';
    }


    static getInstanceUrl (revOffset=0) {
        return new Promise((accept, reject) => {
            let url = "/storage/files/";
            url += this.id;
            url += "?revision=";
            url += revOffset;
            
            return accept(url);
        });
    }

    static getInstancePath (rel=true, full=false, revOffset=0) {
        return this.getData(revOffset).then(data => {
            let path = "";
            path += (full==true) ? Storage.root : "";
            path += "/";
            path += this.id;
            path += "/";
            path += data.id;
            path += "-"
            path += this.name;

            return newPromise((accept, reject) => {
                fs.access(path, function() {
                    if (err) { return reject(err); }
                    else {
                        return accept(path);
                    }
                })
            })


        })

        
    }

    static getInstanceDirTree () {
        return this.getCurrent('dirId').then(dirId => {
            if (dirId == 0) {return "";}
            else {
                return db.File.findById(dirId).then(file => {
                    return file.getDirTree().then(tree => {
                        return tree + "/" + this.name;
                    });
                })
            }
        });
    }

    static getInstanceData(offset=0) {
        return db.Data.findAll({limit: 1, offset: offset, where: {fileId: fileId}, order: [['createdAt DESC']]})

    }

    static _computeFileType (fileId) {
        return db.File.findById(fileId).then(file => {
            if (file.isDir) {
                return "Directory";
            } else {
                return new Promise((accept, reject) => {
                    magic.detectFile(Storage.getPath(fileId), function(err, res) {
                        if (err) { return reject(err); }
                        else {
                            return accept(res);
                        }
                    })
                }) ;
            }
        });
    }



    static _computeSize(fileId) {
        Storage.getCurrent(fileId).then(data => {
            if (data.isDir()) {
                db.File.findAll({where: {dirId: fileId}}).then(files => {
                    let fullsize = 0;
                    //TODO : COMPUTE SIZE OF FILES
                })
            } else {
                return new Promise((accept, reject) => {
                    Storage.getPath(fileId).then(path => {
                        fs.stat(path, (err, res) => {
                            if (err) { return reject(err); }
                            else {
                                return accept(res);
                            }
                        });
                    });
                });
            }
        });
    }


}

module.exports = Storage;
