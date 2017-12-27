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
     * @param {obj} userId - the user identifier
     *
     * @todo finish and test
     * @returns {Object} promise to directory tree
     *
     */
    File.prototype.addData = function (fileChanges, filePath, userId) {
        const db = require('../models');

        fileChanges.fileId = this.id;
        fileChanges.ownerId = userId;

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


            return db.User.findById(userId).then((user) => user.getGroups())
                // Check user is in group
                .then((groups) => {
                    if (isNaN(parseInt(changes.groupId, 10))) {
                        throw new RangeError('Group is not an integer');
                    }
                    changes.groupId = parseInt(changes.groupId, 10);
                    const groupIds = groups.map((grp) => grp.id);

                    if (!groupIds.includes(changes.groupId)) {
                        throw new RangeError('Invalid group');
                    }

                    return true;
                })
                // Find right or create it
                .then(() => {
                    if (newRight) {
                        return db.Right.create(changes);
                    }

                    return db.File.findOne({where: {id: changes.fileId}}).then((file) => file.getData());

                })
                .then((right) => {
                    changes.rightsId = right.id;

                    return true;
                });
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
            });
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
     * @param {integer} userId the user id
     * @param {boolean} dir whether the file is a directory or not
     * @todo max-params
     *
     * @returns {Object} promise to success boolean
     *
     */
    // eslint-disable-next-line max-params
    File.createNew = function (changes, filePath, userId, dir = false) {
        const db = require('../models');

        return db.File.create({isDir: dir})
            .then((file) => file.addData(changes, filePath, userId));
    };


    return File;
};
