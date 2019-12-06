'use strict';


const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');

require('dotenv').config();
const config = require(path.join(root, './src/config/config'));

module.exports.setupPrototype = function (Data) {

    
    Data.prototype.getUrl = function () {
        let url = '/storage/files/';

        url += this.fileId;
        url += '?revision=';
        url += this.id;

        // Force return of a promise
        return Promise.resolve(url);
    };

    
    Data.prototype.getPath = async function () {
        let dataPath = '';

        if(!this.id) {
            throw new Error('Cannot find path for un-saved data !')
        }
        let id = this.id;

        if(this.isDir) {
            throw new Error('Cannot find path for folder !');
        }
        dataPath += `/${this.fileId}`;
        dataPath += `/${this.name}-#${id}`;

        return Promise.resolve(path.join(config.storage.folder, dataPath));

    };

    Data.prototype.getRights = function (db) {
        // Only one right should exist for each data, no check needed

        return db.Right.findByPk(this.rightsId);
    };
};
