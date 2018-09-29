'use strict';


const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');

require('dotenv').config();
const config = require(path.join(root, './config/config'));

module.exports.setupPrototype = function (Data, sequelize) {

    /**
     *
     * Get URL for a data object.
     * Is designed to be bound to the data object.
     *
     * @returns {string} Data URL.
     *
     */
    Data.prototype.getUrl = function () {
        let url = '/storage/files/';

        url += this.fileId;
        url += '?revision=';
        url += this.id;

        // Force return of a promise
        return Promise.resolve(url);
    };

    /**
     *
     * Get file system path for a data object.
     * Is designed to be bound to the data object.
     *
     * @function getPath
     *
     * @todo fix
     *
     *
     * @returns {string} Data path.
     *
     */
    Data.prototype.getPath = async function (db) {
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

    /**
     *
     * Get rights for a data object.
     *
     * @param {obj} db - The database.
     * @returns {Object} Promise to rights.
     *
     */
    Data.prototype.getRights = function (db) {
        // Only one right should exist for each data, no check needed

        return db.Right.findById(this.rightsId);
    };
};
