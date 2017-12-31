/* eslint no-invalid-this: "warn", max-lines: "warn" */

'use strict';

/**
 * @file
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const mv = require('mv');
const mmm = require('mmmagic');
const Magic = mmm.Magic;
const magic = new Magic(mmm.MAGIC_MIME_TYPE);


class Storage {

/**
 *
 * Get root Storage path. in file system.
 *
 * @returns {string} storage path
 *
 */
    static get root () {
        return path.join(__dirname, '..', config.storage.folder);
    }

    /**
     *
     * Get base url for storage requests.
     *
     * @returns {string} Storage url.
     *
     */
    static get baseUrl () {
        let conf = config.env.prod;

        if (process.env.DEV) {
            conf = config.env.dev;
        }


        return `https://${conf.host}:${conf.port}/storage`;
    }
}

module.exports = Storage;

/**
 *
 * Get URL for a data object.
 * Is designed to be bound to the data object.
 *
 * @returns {string} Data URL.
 *
 */
Storage.getDataUrl = () => {
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
 * @todo fix
 *
 * @param {bool} full - Get full path or relative path.
 *
 * @returns {string} Data path.
 *
 */
Storage.getDataPath = function (full = false) {
    let dataPath = '';

    if (full) {
        dataPath += Storage.root;
    }
    dataPath += `/${this.fileId}`;
    dataPath += `/${this.id}`;
    dataPath += `-${this.name}`;

    console.log(dataPath);

    // Check file exists
    fs.access(dataPath, fs.constants.F_OK, (err) => {
        if (err) {
            return Promise.reject(err);
        }


        // Return file path if it exists
        return Promise.resolve(dataPath);

    });

};

/**
 *
 * Get diretory tree for a file object.
 *
 * @returns {Object} Promise to directory tree.
 *
 */
Storage.getFileDirTree = function () {
    const db = require('../models');

    return this.getData()
        .then((data) => {
            // Get parents' directory tree
            let fileDirTree = Promise.resolve([]);

            if (data.dirId !== 1) {
                fileDirTree = db.File.findById(data.dirId).then((file) => file.getDirTree());
            }

            // Add own directory name
            return fileDirTree.then((tree) => tree.concat(data.name));
        });
};

/**
 *
 * Get all data for a file object.
 *
 * @param {integer} offset - How old the data is.
 *
 * @returns {Object} Promise to file data.
 *
 */
Storage.getFileData = function (offset = 0) {
    const db = require('../models');

    return db.Data

    // Like findOne, but with order + offset
        .findAll({
            limit: 1,
            offset,
            where: {fileId: this.id},
            order: [
                [
                    'createdAt',
                    'DESC'
                ]
            ]
        })

        // FindAll is limited, so there will always be one result (or none -> undefined)
        .then((data) => {
            if (data.length === 0) {
                throw new Error();
            }

            return data[0];
        });
};

/**
 *
 * Get rights for a data object.
 *
 * @returns {Object} Promise to rights.
 *
 */
Storage.getDataRights = function () {
    const db = require('../models');

    // Only one right should exist for each data, no check needed
    return db.Right.findOne({where: {id: this.rightsId}});
};

/**
 *
 * Add data for a file object.
 *
 * @param {obj} fileChanges - The changes in this data.
 * @param {obj} filePath - The path to the file to add data to.
 *
 * @todo finish and test
 * @returns {Object} Promise to directory tree.
 *
 */
Storage.addFileData = function (fileChanges, filePath) {
    const db = require('../models');

    fileChanges.fileId = this.id;

    const fileBuilder = (changes, builderPath) =>
        new Promise((resolve) => {
            fs.access(builderPath, (err) => {
                fileChanges.fileExists = !err;
                resolve();
            });
        });

    const rightsBuilder = (changes) => {
        let newRight = false;
        const rights = [
            'ownerRead',
            'ownerWrite',
            'groupRead',
            'groupWrite',
            'allRead',
            'allWrite'
        ];

        for (const i of rights) {
            if (typeof changes[i] !== 'undefined') {
                newRight = true;
                break;
            }
        }


        if (typeof changes.ownerId === 'undefined') {
            // Changes.ownerId = req.session.auth
        } else {
            // Not yet supported
        }

        if (typeof changes.groupId === 'undefined') {

            /*
             * OwnerId = req.session.auth
             * groups = getGroups(ownerId)
             * if(groups.length == 0) {}
             * else if(groups.length == 1)getMainGroup {}
             * else {}
             */
        } else {
            // Not yet supported
        }

        if (newRight) {

            // New right
            return db.Right.create(changes)
                .then((right) => {
                    changes.rightsId = right.id;

                    return true;
                });
        }

        // Use previous rights
        return db.File.findOne({where: {id: changes.fileId}})
            .then((file) => file.getData())
            .then((data) => {
                changes.rightsId = data.id;

                return true;
            });

        /*
         * TODO : if previous right not found (first upload),
         *        Create new right with default values
         */

    };

    // Build the rights and file properties
    return Promise.all([
        rightsBuilder(fileChanges, filePath),
        fileBuilder(fileChanges, filePath)
    ])

        // Create the data and save it
        .then(() => db.Data.create(fileChanges))

        // Get destination
        .then((data) => data.getPath())

        // Move file from temp
        .then((dest) => {
            if (fileChanges.fileExists) {
                mv(
                    // Make directory if needed, error if exists
                    filePath, dest,
                    {
                        mkdirp: true,
                        clobber: false
                    },
                    (err) => {
                        if (err) {
                            throw err;
                        }

                        return true;
                    }
                );

            }

            return true;
        })

        .catch((err) => console.log(err));
};

/**
 *
 * Create a new file object.
 *
 * @param {Object} changes - The file metadata.
 * @param {string} filePath the file path to create.
 * @param {boolean} dir Whether the file is a directory or not.
 *
 * @returns {Object} promise to success boolean
 *
 */
Storage.createNewFile = function (changes, filePath, dir = false) {
    const db = require('../models');

    return db.File.create({isDir: dir})
        .then((file) => file.addData(changes, filePath));
};

/**
 *
 * Compute type for a file path.
 *
 * @param {Object} filePath - The file to compute size.
 *
 * @returns {Object} Promise to file type.
 *
 */
Storage.computeType = function (filePath) {
    magic.detectFile(filePath, (err, res) => {
        if (err) {
            return Promise.reject(err);
        }


        return Promise.resolve(res);

    });

};

/**
 *
 * Compute size for a file path.
 *
 * @param {Object} filePath - The file to compute size.
 *
 * @returns {Object} promise to file size
 *
 */
Storage.computeSize = function (filePath) {
    fs.stat(filePath, (err, res) => {
        if (err) {
            throw err;
        } else {

            // Return file size
            return res.size;
        }
    });
};
