/* eslint no-invalid-this: "warn", max-lines: "warn" */

'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const mmm = require('mmmagic');
const Magic = mmm.Magic;
const magic = new Magic(mmm.MAGIC_MIME_TYPE);


class Storage {

/**
 *
 * Get root Storage path. In file system.
 *
 * @returns {string} Storage path.
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
 * Compute type for a file path.
 *
 * @param {Object} filePath the file to compute size
 *
 * @returns {Object} promise to file type
 *
 */
Storage.computeType = function (filePath) {
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
 * @param {Object} filePath the file to compute size
 *
 * @returns {Object} promise to file size
 *
 */
Storage.computeSize = function (filePath) {
    return new Promise((resolve) => {
        fs.stat(filePath, (err, res) => {
            if (err) {
                throw err;
            } else {

                // Return file size
                resolve(res.size);
            }
        });
    });
};

Storage.fileHasWritePermission = async (fileId, userId) => {
    const db = require('../models');

    const fileP = db.File.findById(fileId);
    const userP = db.User.findById(userId);
    const file = await fileP;
    const user = await userP;

    if (!file || !user) {
        return false;
    }

    const fileDataP = file.getData();
    const userGroupsP = user.getGroups();
    const userGroups = await userGroupsP;
    const fileData = await fileDataP;

    const fileRightsP = fileData.getRights();

    const userGroupsIds = userGroups.map((group) => group.id);
    const userIsInGroup = userGroupsIds.includes(fileData.groupId);
    const userIsOwner = fileData.ownerId === userId;

    const fileRights = await fileRightsP;


    if (fileRights.allWrite === true) {
        return true;
    } else if (userIsInGroup === true && fileRights.groupWrite === true) {
        return true;
    } else if (userIsOwner === true && fileRights.ownerWrite === true) {
        return true;
    }

    return false;
};

Storage.fileHasReadPermission = async (fileId, userId) => {
    const db = require('../models');

    const fileP = db.File.findById(fileId);
    const userP = db.User.findById(userId);
    const file = await fileP;
    const user = await userP;

    if (!file || !user) {
        return false;
    }

    const fileDataP = file.getData();
    const userGroupsP = user.getGroups();
    const userGroups = await userGroupsP;
    const fileData = await fileDataP;

    const fileRightsP = fileData.getRights();

    const userGroupsIds = userGroups.map((group) => group.id);
    const userIsInGroup = userGroupsIds.includes(fileData.groupId);
    const userIsOwner = fileData.ownerId === userId;

    const fileRights = await fileRightsP;

    if (fileRights.allRead === true) {
        return true;
    } else if (userIsInGroup === true && fileRights.groupRead === true) {
        return true;
    } else if (userIsOwner === true && fileRights.ownerRead === true) {
        return true;
    }

    return false;
};
