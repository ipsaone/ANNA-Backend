'use strict';

/**
 * @file Defines a model for 'File' table in database and its associations with the other tables
 * @see {@link module:file}
 */
const mv = require('mv');
const fs = require('fs');
const util = require('util');

/**
 * @module file
 */

/**
 * Defines a mapping between model and table 'File'
 * @function exports
 *
 * @param {Object} sequelize - The Sequelize object.
 * @param {Object} DataTypes - DataTypes
 *
 * @returns {Object} Returns File
 *
 */

module.exports = (sequelize, DataTypes) => {
    const File = sequelize.define('File', {
        isDir: {
            allowNull: false,
            type: DataTypes.BOOLEAN
        }
    }, {
        timestamps: true,
        paranoid: true,
        scopes: {
            files: {where: {isDir: false}},
            folders: {where: {isDir: true}}
        }
    });

    File.associate = function (db2) {

        /**
         * Creates plural associations with table 'Log'
         * @function belongsToManyLog
         */
        File.belongsToMany(db2.Log, {
            as: 'fileLogs',
            through: db2.FileLog,
            foreignKey: 'logId'
        });

        /**
         *
         * Add data for a file object.
         *
         * @param {obj} db - The database.
         * @param {obj} fileChanges - The changes in this data.
         * @param {obj} filePath - The path to the file to add data to.
         * @param {obj} userId - The user identifier.
         *
         * @todo finish and test
         * @returns {Object} Promise to directory tree.
         *
         */
        File.prototype.addData = async function (db, fileChanges, filePath, userId) {

            /*
             * Check group ID input
             * Other integer inputs are replaced anyway
             */
            const previousData = await this.getData(db);

            if (isNaN(parseInt(fileChanges.groupId, 10))) {
                if (previousData) {
                    fileChanges.groupId = previousData.groupId;
                } else {
                    throw new Error('Group is not an integer');
                }
            } else {
                fileChanges.groupId = parseInt(fileChanges.groupId, 10);
            }

            // Check isDir
            if (fileChanges.isDir === 'true' || fileChanges.isDir === true) {
                fileChanges.isDir = true;
            } else {
                fileChanges.isDir = false;
            }

            // Replace fileId and ownerId, they are not needed
            fileChanges.fileId = this.id;
            if (userId) {
                fileChanges.ownerId = userId;
            }

            if (previousData && !fileChanges.name) {
                fileChanges.name = previousData.name;
            }

            // Find if creating a right is needed
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
                if (typeof fileChanges[i] !== 'undefined') {
                    newRight = true;
                    break;
                }
            }

            // Get groups for user and check groupId is legitimate
            const user = await db.User.findById(fileChanges.ownerId);

            if (!user) {
                throw new Error('Invalid user');
            }
            const groups = await user.getGroups(db);

            if (!groups.map((grp) => grp.id).includes(fileChanges.groupId)) {
                throw new Error('Invalid group');
            }

            // Create new right, or find the previous right and keep it
            let right = {};

            if (newRight) {
                right = await db.Right.create(fileChanges);
            } else {
                const file = await db.File.findById(fileChanges.fileId);
                const fileData = await file.getData(db);

                if (!fileData) {
                    right = await db.Right.create(fileChanges);
                } else {
                    right = await fileData.getRights(db);
                }

                if(!right) {
                    throw new Error('Internal error : no rights associated with data #'+fileData.id);
                }
            }
            fileChanges.rightsId = right.id;

            // Check file upload
            const access = util.promisify(fs.access);

            try {
                await access(filePath);
                fileChanges.exists = true;
            } catch (err) {
                fileChanges.exists = false;
            }

            const data = await db.Data.create(fileChanges);
            const dest = await data.getPath(db);

            if (fileChanges.exists) {

                if(fileChanges.isDir) {
                    throw new Error('Cannot handle an upload for a folder !')
                }

                const move = util.promisify(mv);
                await move(filePath, dest, {mkdirp: true,  clobber: true});
            } 

            await data.computeValues();
            await data.save();

            return data;

        };


        /**
         *
         * Get all data for a file object.
         *
         * @param {obj} db - The database.
         * @param {integer} offset - How old the data is.
         *
         * @returns {Object} Promise to file data.
         *
         */
        File.prototype.getData = function (db, offset = 0) {

            return db.Data

            // Like findOne, but with order + offset
                .findAll({
                    limit: 1,
                    offset,
                    where: {fileId: this.id},
                    include: ['rights'],
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
                        return;
                    }

                    return data[0];
                });
        };

        /**
         *
         * Get diretory tree for a file object.
         *
         * @param {obj} db - The database.
         * @returns {Object} Promise to directory tree.
         *
         */
        File.prototype.getDirTree = async function (db) {
            const data = await this.getData(db);

            // Get parents' directory tree
            let fileDirTree = [];
            if(!data) {
                return fileDirTree;
            }

            if (data.dirId !== 1) {
                const file = await db.File.findById(data.dirId);

                fileDirTree = await file.getDirTree(db);
            }

            // Add own directory name
            return fileDirTree.concat(data.name);
        };


        /**
         *
         * Create a new file object.
         *
         * @param {obj} db - The database.
         * @param {Object} changes - The file metadata.
         * @param {string} filePath - The file path to create.
         * @param {integer} userId - The user id.
         * @todo max-params
         *
         * @returns {Object} Promise to success boolean.
         *
         */
        File.createNew = function (db, changes, filePath, userId) {
            let isDir = false;

            if (typeof changes.isDir !== 'undefined' && (changes.isDir === true || changes.isDir === 'true')) {
                isDir = true;
            }

            return db.File.create({isDir})
                .then((file) => file.addData(db, changes, filePath, userId));
        };

    };


    return File;
};
