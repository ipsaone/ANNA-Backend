'use strict';

/**
 * @file
 * @see {@link module:storage}
 */

/**
 * @module storage
 */

const storage = require('../repositories/Storage');
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
 * @param {INTEGER} folderId - The id of the selected folder.
 * @param {INTEGER} userId - The id of the user.
 * @returns {Promise} Uploads a file if directory has 'write' Permission.
 */
exports.filterUploadNew = (folderId, userId) =>

    /** Check if directory has 'write' permission */
    storage.fileHasWritePermission(folderId, userId);

/**
 * Filters users who can update files.
 *
 * @function filterUploadRev
 * @async
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


    return storage.fileHasWritePermissions(file.dirId, userId);

};

/**
 * Filters users who can download metadata.
 *
 * @function filterDownloadMeta
 * @async
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

    return storage.fileHasReadPermissions(file.dirId, userId);

};

/**
 * Filters users who can download files.
 *
 * @function filterDownloadContents
 * @async
 *
 * @param {INTEGER} fileId - The id of the file.
 * @param {INTEGER} userId - The id of the user.
 *
 * @returns {Promise} Downloads files if file has 'read' permission.
 */
exports.filterDownloadContents = async (fileId, userId) => {

    /**
     * Checks if file has 'read' permission
     * @const file
     */
    const file = await db.File.findById(fileId);

    return storage.fileHasReadPermissions(file, userId);
};

exports.filterDelete = (folderId, userId) =>
    // Check if directory has 'write' permission
    storage.fileHasWritePermission(folderId, userId);
