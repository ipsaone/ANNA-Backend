'use strict';

const mv = require('mv');
const fs = require('fs');
const util = require('util');


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

        
        File.belongsToMany(db2.Log, {
            as: 'fileLogs',
            through: db2.FileLog,
            foreignKey: 'logId'
        });
        

        File.prototype.addData = async function (db, fileChanges, filePath, userId) {

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

            // self-move check
            if(this.isDir && fileChanges.dirId && fileChanges.dirId == this.id) {
                throw new Error('Cannot move folder inside itself');
            }

            // Check isDir
            if (fileChanges.isDir === 'true' || fileChanges.isDir === true) {
                fileChanges.isDir = true;
            } else {
                fileChanges.isDir = false;
            }

            // Check serialNbr
            if(fileChanges.serialNbr && this.isDir) {
                throw new Error('Cannot give serialNbr to folder');
            }

            // Replace fileId and ownerId, they are not needed
            fileChanges.fileId = this.id;
            if (userId) {
                fileChanges.ownerId = userId;
            }

            if (previousData && !fileChanges.name) {
                fileChanges.name = previousData.name;
            } else {
                // WHY IS IT URLENCODED ? I DON'T KNOW.
                fileChanges.name = decodeURIComponent(fileChanges.name);
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
            const user = await db.User.findByPk(fileChanges.ownerId);

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
                const file = await db.File.findByPk(fileChanges.fileId);
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


        File.prototype.getData = async function (db, offset = 0) {

            let data = await db.Data

            // Like findOne, but with order + offset
                .findAll({
                    limit: 1,
                    offset,
                    where: {fileId: this.id},
                    include: ['rights'],
                    order: [
                        [
                            'createdAt', 'DESC'
                        ]
                    ]
                });

            // FindAll is limited, so there will always be one result (or none -> undefined)
            if (data.length === 0) {
                return;
            }

            return data[0];
        };

        File.prototype.getDirTree = async function (db) {
            const data = await this.getData(db);

            // Get parents' directory tree
            let fileDirTree = [];
            if(!data) {
                return fileDirTree;
            }

            if (data.dirId !== 1) {
                const file = await db.File.findByPk(data.dirId);

                fileDirTree = await file.getDirTree(db);
            }

            // Add own directory name
            return fileDirTree.concat(data.name);
        };


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
