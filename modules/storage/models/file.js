'use strict';

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');

/**
 * @file Defines a model for 'File' table in database and its associations with the other tables
 * @see {@link module:file}
 */
const mv = require('mv');
const fs = require('fs');

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

    File.associate = function (models) {

        /**
         * Creates plural associations with table 'Log'
         * @function belongsToManyLog
         */
        File.belongsToMany(models.Log, {
            as: 'fileLogs',
            through: models.FileLog,
            foreignKey: 'logId'
        });
    };


    /**
     *
     * Add data for a file object.
     *
     * @param {obj} fileChanges - The changes in this data.
     * @param {obj} filePath - The path to the file to add data to.
     * @param {obj} userId - The user identifier.
     *
     * @todo finish and test
     * @returns {Object} Promise to directory tree.
     *
     */
    File.prototype.addData = async function (fileChanges, filePath, userId) {
        const db = require(path.join(root, './modules'));

        /*
         * Check group ID input
         * Other integer inputs are replaced anyway
         */
        if (isNaN(parseInt(fileChanges.groupId, 10))) {
            throw new Error('Group is not an integer');
        }
        fileChanges.groupId = parseInt(fileChanges.groupId, 10);

        // Check isDir
        if (fileChanges.isDir === 'true') {
            fileChanges.isDir = true;
        } else {
            fileChanges.isDir = false;
        }

        // Replace fileId and otherId, they are not needed
        fileChanges.fileId = this.id;
        fileChanges.ownerId = userId;

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
        const groups = await user.getGroups();

        if (!groups.map((grp) => grp.id).includes(fileChanges.groupId)) {
            throw new Error('Invalid group');
        }

        // Create new right, or find the previous right and keep it
        let right = {};

        if (newRight) {
            right = await db.Right.create(fileChanges);
        } else {
            const file = await db.File.findById(fileChanges.fileId);
            const fileData = await file.getData();

            right = await fileData.getRights();
        }
        fileChanges.rightsId = right.id;

        // Check file upload
        await new Promise((resolve) => {
            fs.access(filePath, (err) => {
                fileChanges.fileExists = !err;
                console.log(`File exists : ${!err}`);
                resolve();
            });
        });

        const data = await db.Data.build(fileChanges);
        const dest = await data.getPath();

        if (fileChanges.fileExists && !fileChanges.isDir) {
            return new Promise((resolve, reject) => {
                console.log(`Moving from ${filePath} to ${dest}`);

                mv(
                    // Make directory if needed, error if exists
                    filePath, dest,
                    {
                        mkdirp: true,
                        clobber: false
                    },
                    (err) => {
                        if (err) {
                            console.log('Error while moving file : ', err);
                            reject(err);
                        }

                        return resolve();
                    }
                );
            }).then(() => data.save());

        } else if (!fileChanges.fileExists && fileChanges.isDir) {
            await data.save();

            return data;
        }
        throw new Error('Upload failed !');


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
    File.prototype.getData = function (offset = 0) {
        const db = require(path.join(root, './modules'));

        console.log(`Finding data of file #${this.id} with offset ${offset}`);

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
                    return {};
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
    File.prototype.getDirTree = async function () {
        const db = require(path.join(root, './modules'));

        const data = await this.getData();

        // Get parents' directory tree
        let fileDirTree = [];

        if (data.dirId !== 1) {
            const file = await db.File.findById(data.dirId);

            fileDirTree = await file.getDirTree();
        }

        // Add own directory name
        return fileDirTree.concat(data.name);
    };


    /**
     *
     * Create a new file object.
     *
     * @param {Object} changes - The file metadata.
     * @param {string} filePath - The file path to create.
     * @param {integer} userId - The user id.
     * @todo max-params
     *
     * @returns {Object} Promise to success boolean.
     *
     */
    File.createNew = function (changes, filePath, userId) {
        const db = require(path.join(root, './modules'));

        let isDir = false;

        if (typeof changes.isDir !== 'undefined' && (changes.isDir === true || changes.isDir === 'true')) {
            isDir = true;
        }

        return db.File.create({isDir})
            .then((file) => file.addData(changes, filePath, userId));
    };


    return File;
};
