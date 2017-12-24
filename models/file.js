'use strict';

const mv = require('mv');
const fs = require('fs');

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

    const Storage = require('../repositories/Storage');

    File.associate = function (models) {
        File.belongsTo(models.User, {
            foreignKey: 'ownerId',
            as: 'owner'
        });
        File.belongsTo(models.Group, {
            foreignKey: 'groupId',
            as: 'group'
        });
        File.belongsToMany(models.Log, {
            as: 'fileLogs',
            through: models.FileLog,
            foreignKey: 'userId'
        });
    };


    /**
     *
     * Add data for a file object.
     *
     * @param {obj} fileChanges the changes in this data.
     * @param {obj} filePath the path to the file to add data to
     *
     * @todo finish and test
     * @returns {Object} promise to directory tree
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
     * Get all data for a file object.
     *
     * @param {integer} offset - how old the data is
     *
     * @returns {Object} promise to file data
     *
     */
    File.prototype.getData = function (offset = 0) {
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
     * Get diretory tree for a file object.
     *
     * @returns {Object} Promise to directory tree.
     *
     */
    File.prototype.getDirTree = function () {
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
     * Create a new file object.
     *
     * @param {Object} changes the file metadata.
     * @param {string} filePath the file path to create
     * @param {boolean} dir whether the file is a directory or not
     *
     * @returns {Object} promise to success boolean
     *
     */
    File.createNew = function (changes, filePath, dir = false) {
        const db = require('../models');

        return db.File.create({isDir: dir})
            .then((file) => file.addData(changes, filePath));
    };


    return File;
};
