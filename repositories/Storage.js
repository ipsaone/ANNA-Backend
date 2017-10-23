'use strict';

require('dotenv').config();

const fs = require('fs');
const _path = require('path');
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
}

module.exports = Storage;


Storage.getDataUrl = () => {
    let url = '/storage/files/';
        url += this.fileId;
        url += '?revision=';
        url += this.id;

    // Force return of a promise 
    return Promise.resolve(url);
}

Storage.getDataPath = function (full = false) {

    // Compute file system path
    let path = '';
        path += (full) ? Storage.root : '';
        path += '/' + this.fileId;
        path += '/' + this.id;
        path += '-' + this.name;

    // Check file exists
    return Promise.resolve(() => {
        fs.access(path, (err, res) => {
            if (err) { throw(err); }
            else {

                // Return file path if it exists
                return path;
            }
        });
    });
}

Storage.getFileDirTree = function () {
    const db = require('../models');
    return this.getData()

        
        .then(data => {
            // Get parents' directory tree
            let tree = 
                (data.dirId === 1)
                ? Promise.resolve([]) 
                : db.File.findById(data.dirId).then(file => file.getDirTree());

            // Add own directory name
            return tree.then(tree => concat(data.name));
        });
}

Storage.getFileData = function (offset = 0) {
    const db = require('../models');
    return db.Data

        // like findOne, but with order + offset
        .findAll({
            limit: 1,
            offset: offset,
            where: {fileId: this.id},
            order: [['createdAt', 'DESC']]
        })

        // findAll is limited, so there will always be one result (or none -> undefined)
        .then(data => data[0])
}

Storage.getDataRights = function () {
    const db = require('../models');

    // only one right should exist for each data, no check needed
    return db.Right.findOne({where: {id: this.rightsId}})
}

Storage.addFileData = function (changes, path) {
    const db = require('../models');


    changes.fileId = this.id;

    let fileBuilder = function (changes, path) {
        return new Promise((accept) => {
            fs.access(path, err => {
                if (err) { 
                    changes.fileExists = false; 
                }
                else {
                    changes.fileExists = true;
                }

                accept();
            });
        });
    };

    let rightsBuilder = function (changes, path) {

        let newRight = false;
        let rights = ["ownerRead", "ownerWrite", "groupRead", "groupWrite", "allRead", "allWrite"]
        for(let i of rights) {
            if (typeof(changes[i]) !== "undefined") {
                newRight = true;
                break;
            }
        }


        if (newRight) {

            // New right
            return db.Right.create(changes)
                .then(right => {changes.rightsId = right.id})
        } else {

            // Use previous rights
            return db.File.findOne({where: {id: changes.fileId}})
                .then(file => file.getData())
                .then(data => {changes.rightsId = data.id})

                // TODO : if previous right not found (first upload),
                //        create new right with default values
        }
    }



        // Build the rights and file properties
    return Promise.all([rightsBuilder(changes, path), fileBuilder(changes, path)])

        .then(() => console.log("here"))

        // Create the data and save it
        .then(() => db.Data.create(changes))

        .then(data => {console.log("there"); return data;})

        // Get destination
        .then(data => data.getPath())

        // Move file from temp
        .then(dest => {
            if (changes.fileExists) {
                mv( path, dest,
                    {mkdirp: true, clobber: false}, // make directory if needed, error if exists
                    err => {if (err) throw err}       // error if something happens
                );
                    
            }
        })

        .then(() => res.json({}))

        .then(() => console.log("done !!"))

        .catch(err => console.log(err));
}

Storage.createNewFile = function (changes, path, dir = false) {
    const db = require('../models');

    return db.File.create({isDir: dir})
        .then(file => file.addData(changes, path));
}

Storage.computeType = function (path) {
    return Promise.resolve((accept, reject) => {
        magic.detectFile(path, (err, res) => {
            if (err) { return reject(err); }
            else {

                return accept(res);
            }
        });
        
    });
}

Storage.computeSize = function (path) {
    fs.stat(path, (err, res) => {
        if (err) { throw(err); }
        else {

            // Return file size 
            return res.size;
        }
    });
}

