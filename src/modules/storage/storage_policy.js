'use strict';

/**
 * @file
 * @see {@link module:storage}
 */

/**
 * @module storage
 */
const storage = require('./repository/storage');

/**
 * List files in directory.
 *
 * @function filterList
 * @param {obj} db - The database.
 * @param {INTEGER} folderId - The id of the selected folder.
 * @param {INTEGER} userId - The id of the user.
 * @returns {Promise} List all files.
 */
exports.filterList = async (transaction, folderId, userId) => {

    transaction.logger.info('Granting access on read permission');

    /** Check if directory has 'read' permission */
    return storage.fileHasReadPermission(transaction, folderId, userId);
}

/**
 * Filters users who can upload files.
 *
 * @function filterUploadNew
 *
 * @param {obj} db - The database.
 * @param {INTEGER} folderId - The id of the selected folder.
 * @param {INTEGER} userId - The id of the user.
 *
 * @returns {Promise} Uploads a file if directory has 'write' Permission.
 */
exports.filterUploadNew = async (transaction, folderId, userId) => {
    transaction.logger.info('Filtering new upload');

    /** Check if directory has 'write' permission */
    const canWriteP = storage.fileHasWritePermission(transaction, folderId, userId);
    const folder = await transaction.db.File.findByPk(folderId);
    const canWrite = await canWriteP;

    if (!folder) {
        transaction.logger.info(`no folder #${folderId}`);

        return false;
    }

    transaction.logger.info('Returning authorization', { canWrite, isDir: folder.isDir});
    return canWrite && folder.isDir;

};

/**
 * Filters users who can update files.
 *
 * @function filterUploadRev
 *
 * @param {obj} db - The database.
 * @param {INTEGER} fileId - The id of the file.
 * @param {INTEGER} userId - The id of the user.
 *
 * @returns {Promise} Update metadata if resolved.
 */
exports.filterUploadRev = async (transaction, fileId, userId) => {
    transaction.logger.info('Filtering revision upload');

    /**
     * Check if directory has 'write' permission for metadata update
     * Check if file has 'write' permission for file update
     * @const file
     */

    transaction.logger.debug('Finding file');
    const file = await transaction.db.File.findByPk(fileId);

    if (!file) {
        transaction.logger.info(`File not found : #${fileId}`);

        return false;
    }

    transaction.logger.info('Finding data');
    const lastData = await file.getData(transaction.db);

    if (!lastData) {
        transaction.logger.warn(`No data for file #${fileId}`);
    }


    transaction.logger.info('Finding write permission');
    return storage.fileHasWritePermission(transaction, lastData.dirId, userId);

};

/**
 * Filters users who can download metadata.
 *
 * @function filterDownloadMeta
 *
 * @param {obj} db - The database.
 * @param {INTEGER} fileId - The id of the file.
 * @param {INTEGER} userId - The id of the user.
 *
 * @returns {Promise} Downloads metadata if directory has 'read' permission.
 */
exports.filterDownloadMeta = async (transaction, fileId, userId) => {

    /**
     * Checks if directory has 'read' permissions for metadata download
     * @const file
     */
    transaction.logger.info('finding file');
    const file = await transaction.db.File.findByPk(fileId);

    if (!file) {
        transaction.logger.info(`No file with id ${fileId}`);

        return false;
    }

    transaction.logger.info('Finding data');
    const lastData = await file.getData(transaction.db);

    if (!lastData) {
        transaction.logger.warn(`No data for file #${fileId}`);
    }

    transaction.logger.info('Authorization granted if read permission');
    return storage.fileHasReadPermission(transaction, lastData.dirId, userId);

};

exports.filterDownloadContents = async (transaction, fileId, userId) => {

    transaction.logger.info('Finding file');
    const file = await transaction.db.File.findByPk(fileId);

    if (file.isDir) {
        transaction.logger.info('File is directory, denying');
        return false;
    }

    transaction.logger.info('Authorization granted if read permission');
    return storage.fileHasReadPermission(transaction, fileId, userId);
};

exports.filterDelete = async (transaction, fileId, userId) => {

    if(fileId == 1) {
        transaction.logger.info('Denying suppression of file 1');
        return false;
    }

    transaction.logger.info('filtering deletion for file ', fileId);

    // Check if directory has 'write' permission
    const file = await transaction.db.File.findByPk(fileId);
    if (!file) {
        transaction.logger.info('File not found');
        return false;
    }


    const lastData = await file.getData(transaction.db);
    if (!lastData) {
        transaction.logger.warn(`No data for file #${fileId}`);
    }


    transaction.logger.info('Authorization granted on write permission');
    return storage.fileHasWritePermission(transaction, lastData.dirId, userId);
};
