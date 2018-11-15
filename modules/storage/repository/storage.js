/* eslint no-invalid-this: "warn", max-lines: "warn" */

'use strict';

/**
 * @file
 * @see {@link module:storage}
 */

/**
 * @module storage
 */

require('dotenv').config();

const fs = require('fs');
const findRoot = require('find-root');
const path = require('path');
const mmm = require('mmmagic');
const util = require('util');

const root = findRoot(__dirname);
const config = require(path.join(root, './config/config'));

const Magic = mmm.Magic;
const magic = new Magic(mmm.MAGIC_MIME_TYPE);

class Storage {

/**
 *
 * Get root Storage path. In file system.
 *
 * @function getRoot
 * @returns {string} Storage path.
 * @static
 *
 */
    static get root () {
        return path.join(__dirname, '..', config.storage.folder);
    }

    /**
     * Get base url for storage requests.
     *
     * @function getBaseurl
     * @returns {string} Storage url.
     * @static
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
 * Compute type for a file path.
 *
 * @function computeType
 *
 * @param {Object} filePath - The file to compute size.
 *
 * @returns {Object} Promise to file type.
 *
 */
Storage.computeType = function async (filePath) {

    return new Promise((resolve) => {
        magic.detectFile(filePath, (err, res) => {
            if (err) {
                throw err;
            }

            resolve(res);
        });
    });

};

/**
 *
 * Compute size for a file path.
 *
 * @function computeSize
 *
 * @param {Object} filePath - The file to compute size.
 *
 * @returns {Object} Promise to file size.
 *
 */

Storage.computeSize = async function (filePath) {
    const funct = util.promisify(fs.stat);
    let stat = await funct(filePath);
    return stat.size;
};

Storage.fileHasWritePermission = async (db, fileId, userId) => {
    const fileP = db.File.findByPk(fileId);
    const userP = db.User.findByPk(userId);
    const file = await fileP;
    const user = await userP;

    if (!file || !user) {
        return false;
    }

    const fileDataP = file.getData(db);
    const userGroupsP = user.getGroups(db);
    const userGroups = await userGroupsP;
    const fileData = await fileDataP;

    const fileRightsP = fileData.getRights(db);

    const userGroupsIds = userGroups.map((group) => group.id);
    const userIsInGroup = userGroupsIds.includes(fileData.groupId);
    const userIsOwner = fileData.ownerId === userId;

    const fileRights = await fileRightsP;


    if (userIsOwner === true && fileRights.ownerWrite === true) {
        return true;
    } else if (userIsInGroup === true && fileRights.groupWrite === true) {
        return true;
    } else if (fileRights.allWrite === true) {
        return true;
    }

    return false;
};

Storage.fileHasReadPermission = async (db, fileId, userId) => {
    const fileP = db.File.findByPk(fileId);
    const userP = db.User.findByPk(userId);
    const file = await fileP;
    const user = await userP;

    if (!file || !user) {
        console.error(`Couldn't find file or user for file id ${fileId} and user id ${userId}`);

        return false;
    }

    const fileDataP = file.getData(db);
    const userGroupsP = user.getGroups();
    const userGroups = await userGroupsP;
    const fileData = await fileDataP;
    
    if (!fileData || !userGroups) {
        console.error(`No fileData or userGroups for id ${fileId}`);

        return false;
    }

    const fileRightsP = fileData.getRights(db);

    const userGroupsIds = userGroups.map((group) => group.id);
    const userIsInGroup = userGroupsIds.includes(fileData.groupId);
    const userIsOwner = Boolean(fileData.ownerId === userId);

    const fileRights = await fileRightsP;

    if (!fileRights) {
        console.error('Couldn\'t find associated rights !');

        return false;
    }

    if (fileRights.allRead === true) {
        return true;
    } else if (userIsInGroup === true && fileRights.groupRead === true) {
        return true;
    } else if (userIsOwner === true && fileRights.ownerRead === true) {
        return true;
    }

    return false;
};
