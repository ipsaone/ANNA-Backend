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
        

        File.prototype.addData = async function (transaction) {
            let db = transaction.db;
            let fileChanges = transaction.reqBody;
            let log = transaction.logger;
            const previousData = await this.getData(db);

            log.info("Finding group");
            if (isNaN(parseInt(fileChanges.groupId, 10))) {
                log.info("No groupId given");
                if (previousData) {
                    log.debug("groupId taken from previous data");
                    fileChanges.groupId = previousData.groupId;
                } else {
                    throw transaction.boom.badRequest('Group is not an integer');
                }
            } else {
                log.info("Successful group parse from request");
                fileChanges.groupId = parseInt(fileChanges.groupId, 10);
            }

            // self-move check
            if(this.isDir && fileChanges.dirId && fileChanges.dirId == this.id) {
                log.info("Tried to move folder inside itself");
                throw transaction.boom.badRequest('Cannot move folder inside itself');
            }

            // Check isDir
            if (fileChanges.isDir === 'true' || fileChanges.isDir === true) {
                log.info("directory detected");
                fileChanges.isDir = true;
            } else {
                log.info("file detected");
                fileChanges.isDir = false;
            }

            // Check serialNbr
            if(fileChanges.serialNbr && this.isDir) {
                log.info("Tried giving serialNbr to folder");
                throw transaction.boom.badRequest('Cannot give serialNbr to folder');
            }

            // Replace fileId and ownerId, they are not needed
            fileChanges.fileId = this.id;
            if(!fileChanges.ownerId) {
                log.info("setting ownerId to userId")
                fileChanges.ownerId = transaction.info.userId;
            }

            if (previousData && !fileChanges.name) {
                log.info("Deduced name from previous data");
                fileChanges.name = previousData.name;
            } else {
                // WHY IS IT URLENCODED ? I DON'T KNOW.
                log.info("decoding name from request. WHY IS IT URLENCODED ?");
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
                    log.info("New right needed");
                    newRight = true;
                    break;
                }
            }

            // Get groups for user and check groupId is legitimate
            log.info("Finding owner user");
            const user = await db.User.findByPk(fileChanges.ownerId);

            if (!user) {
                log.info("Failed to find owner user");
                throw transaction.boom.badRequest('Invalid user');
            }

            log.info("Finding owner user groups");
            const groups = await user.getGroups(db);

            if (!groups.map((grp) => grp.id).includes(fileChanges.groupId)) {
                log.info("Couldn't find requested group in owner user groups");
                throw transaction.boom.badRequest('Invalid group');
            }

            // Create new right, or find the previous right and keep it
            let right = {};
            if (newRight) {
                log.info("Creating new right");
                right = await db.Right.create(fileChanges);
            } else {
                if (!previousData) {
                    log.info("No data from previous file, creating new right");
                    right = await db.Right.create(fileChanges);
                } else {
                    log.info("Retrieving right from data");
                    right = await previousData.getRights(db);
                }

                if(!right) {
                    log.error("No rights associated with data", {data : fileData});
                    throw transaction.boom.badImplementation('Internal error : no rights associated with data #'+fileData.id);
                }
            }

            log.info("Replacing request rightsId");
            fileChanges.rightsId = right.id;

            // Check file upload
            const access = util.promisify(fs.access);
            try {
                log.info("Checking uploaded file");
                await access(filePath);
                log.info("Uploaded file found !");
                fileChanges.exists = true;
            } catch (err) {
                log.info("Uploaded file not found", {err});
                fileChanges.exists = false;
            }

            log.info("Creating data");
            const data = await db.Data.create(fileChanges);
            log.debug("Data created", {data});

            log.info("Finding new path for uploaded file");
            const dest = await data.getPath(db);

            if (fileChanges.exists) {

                if(fileChanges.isDir) {
                    log.info("Uploaded file for folder !");
                    throw transaction.boom.badRequest('Cannot handle an upload for a folder !')
                }

                log.info("Moving file");
                const move = util.promisify(mv);
                await move(filePath, dest, {mkdirp: true,  clobber: true});
            } 

            log.info("Computing values from uploaded file");
            await data.computeValues();
            log.debug("Values computed", {data});

            log.info("Saving new data");
            await data.save();
            log.debug("Data saved");

            log.info("Returning new created data");
            log.debug("Returned data details", {data});
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


        File.createNew = async function (transaction) {
            let changes = transaction.reqBody;
            let db = transaction.db;

            let isDir = false;
            if ((typeof changes.isDir !== 'undefined') && (changes.isDir === true || changes.isDir === 'true')) {
                isDir = true;
            }

            let file = await db.File.create({isDir})
            let data = await file.addData(transaction);

            return data;
        
        };

    };


    return File;
};
