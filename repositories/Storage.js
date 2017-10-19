'use strict';

require('dotenv').config();

const fs = require('fs');
const _path = require('path');
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


    static getFileUrl(revOffset = 0) {
        let url = '/storage/files/';
            url += this.id;
            url += '?revision=';
            url += revOffset;

        // Force return of a promise 
        return Promise.resolve(url);
    }

    static getFilePath(revOffset = 0, full = false,) {
        let path = '';
            path += (full) ? Storage.root : '';
            path += '/' + this.id;
            path += '/' + data.id;
            path += '-' + this.name;

        return this.getData(revOffset).then(data => {

            // Check file exists
            fs.access(path, (err, res) => {
                if (err) { throw(err); }
                else {

                    // Return file path if it exists
                    return path;
                }
            });


        });


    }

    static getFileDirTree() {
        return this.getData()

            // Get parents' directory tree
            .then(data => data.dirId <= 0 ? [] : db.File.findById(data.dirId).then(file => file.getDirTree())

            // Add own name :3
            .then(tree => tree.concat(data.name));
    }

    static getFileData(offset = 0) {
        return db.Data

            // like findOne, but with order + offset
            .findAll({
                limit: 1,
                offset: offset,
                where: {fileId: fileId},
                order: [['createdAt DESC']]
            })

            // findAll is limited, so there will always be one result (or none -> undefined)
            .then(data => data[0])

    }

    static getDataRights() {

        // only one right should exist for each data, no check needed
        return db.Right.findOne({where: {id: this.rightsId}})
    }

    static _computeFileType() {
        // TODO : check what detectFile() does on folders
        //        probably could be simplified a lot

        return this.getData()
            .then(data => {
                if (data.isDir) { return 'Directory'; }

                return this.getPath()
                    .then(path => {
                        magic.detectFile(path, (err, res) => {
                            if (err) { throw err; }
                            else {

                                return res;
                            }
                        });
                });
            
        });
    }


    static _computeFileSize() {
        this.getData()
            .then(data => {

                // If asking directory size, compute the sum of all sizes of files 
                if (data.isDir()) {
                    return db.File.findAll({where: {dirId: fileId}})

                        // Compute all sizes in an array
                        .then(files => Promise.all(files.map(file => file._computeSize()))

                        // Compute the sum of all the sizes
                        .then(sizes => sizes.reduce((a, b) => a + b, 0));
                        
                    });
                } 

                
                // If asking file size, first get the FS file path and then get its size
                return db.File.findOne({where: {id: fileId}}).then(file => file.getPath())

                    // Get file statistics
                    .then(path => {
                        fs.stat(path, (err, res) => {
                            if (err) { throw(err); }
                            else {

                                // Return file size 
                                return res.size;
                            }
                        });
                    });
                
                
            });
    }


}

module.exports = Storage;
