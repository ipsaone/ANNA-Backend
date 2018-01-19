'use strict';

/**
 * @file
 * @see {@link module:storage}
 */

/**
 * @module storage
 */

const storage = require('../repositories/storage');
const db = require('../models');

/**
 * List files in directory.
 *
 * @function filterList
 * @param {INTEGER} folderId - The id of the selected folder.
 * @param {INTEGER} userId - The id of the user.
 * @returns {Promise} List all files.
 */
exports.filterList = (folderId, userId) =>

    /** Check if directory has 'read' permission */
    storage.fileHasReadPermission(folderId, userId);

/**
 * Filters users who can upload files.
 *
 * @function filterUploadNew
 *
 * @param {INTEGER} folderId - The id of the selected folder.
 * @param {INTEGER} userId - The id of the user.
 *
 * @returns {Promise} Uploads a file if directory has 'write' Permission.
 */
exports.filterUploadNew = async (folderId, userId) => {

    /** Check if directory has 'write' permission */
    const canWriteP = storage.fileHasWritePermission(folderId, userId);
    const folder = await db.File.findById(folderId);
    const canWrite = await canWriteP;

    if (!folder) {
        console.log(`no file #${folderId}`);

        return false;
    }

    console.log(folder);
    console.log(`canWrite : ${canWrite}`);
    console.log(`isDir : ${folder.isDir}`);

    return canWrite && folder.isDir;

};

/**
 * Filters users who can update files.
 *
 * @function filterUploadRev
 *
 * @param {INTEGER} fileId - The id of the file.
 * @param {INTEGER} userId - The id of the user.
 *
 * @returns {Promise} Update metadata if resolved.
 */
exports.filterUploadRev = async (fileId, userId) => {

    /**
     * Check if directory has 'write' permission for metadata update
     * Check if file has 'write' permission for file update
     * @const file
     */

    const file = await db.File.findById(fileId);

    if (!file) {
        return false;
    }

    const lastData = await file.getData();

    if (!lastData) {
        console.log(`No data for file #${fileId}`);
    }


    return storage.fileHasWritePermission(lastData.dirId, userId);

};

/**
 * Filters users who can download metadata.
 *
 * @function filterDownloadMeta
 *
 * @param {INTEGER} fileId - The id of the file.
 * @param {INTEGER} userId - The id of the user.
 *
 * @returns {Promise} Downloads metadata if directory has 'read' permission.
 */
exports.filterDownloadMeta = async (fileId, userId) => {

    /**
     * Checks if directory has 'read' permissions for metadata download
     * @const file
     */
    const file = await db.File.findById(fileId);

    if (!file) {
        console.log(`No file with id ${fileId}`);

        return false;
    }

    const lastData = await file.getData();

    if (!lastData) {
        console.log(`No data for file #${fileId}`);
    }

    return storage.fileHasReadPermission(lastData.dirId, userId);

};

exports.filterDownloadContents = (fileId, userId) => storage.fileHasReadPermission(fileId, userId);

exports.filterDelete = async (fileId, userId) => {

    // Check if directory has 'write' permission

    const file = await db.File.findById(fileId);

    if (!file) {
        return false;
    }

    const lastData = await file.getData();

    if (!lastData) {
        console.log(`No data for file #${fileId}`);
    }

    return storage.fileHasWritePermission(lastData.dirId, userId);
};
