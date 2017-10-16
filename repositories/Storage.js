'use strict';

require('dotenv').config();

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
        if (!process.env.DEV)
            return 'https://' + config.env.prod.host + ':' + config.env.prod.port + '/storage';
        else
            return 'https://' + config.env.dev.host + ':' + config.env.dev.port + '/storage';
    }



    static getUrl (fileId) {
        if (!fileId) {
            return;
        }

        let dirtree = Storage._getDirectoryTree(fileId);

        let url = "";
        for(let dir of dirtree) { url += "/" + dir.name; }
        return url;

    }

    static getData (fileId, revId=null, offset=0) {
        return db.Data.getById(revId).then((data) => {
            return;
        })
    }

    static getDirTree (fileId) {
        return db.File.getById(fileId).then(file => {
            if (file.dirId == 0) {
                return new Promise((resolve, reject) => {
                    return "";
                });
            } else {
                return getDirTree(file.dirId).then(tree => {
                    return tree + "/" + file.name;
                })
            }
        })
    }

    static _computeFileType (fileId) {

    }



    static _computeSize(fileId) {

    }

}

module.exports = Storage;
