'use strict';


const storage = require('./repository/storage');

exports.filterList = async (transaction, folderId, userId) => {

    transaction.logger.info('Granting access on read permission');

    /** Check if directory has 'read' permission */
    return storage.fileHasReadPermission(transaction, folderId, userId);
}

exports.filterUploadNew = async (transaction, folderId) => {
    transaction.logger.info('Filtering new upload');

    /** Check if directory has 'write' permission */
    const canWriteP = storage.fileHasWritePermission(transaction, folderId, transaction.info.userId);
    const folder = await transaction.db.File.findByPk(folderId);
    const canWrite = await canWriteP;

    if (!folder) {
        transaction.logger.info(`no folder #${folderId}`);

        return false;
    }

    transaction.logger.info('Returning authorization', { canWrite, isDir: folder.isDir});
    return canWrite && folder.isDir;

};


exports.filterUploadRev = async (transaction, fileId) => {
    transaction.logger.info('Filtering revision upload');


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
    return storage.fileHasWritePermission(transaction, lastData.dirId, transaction.info.userId);

};

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

exports.filterSearch = async(transaction, files) => {

    transaction.logger.info('Filtering search');

    return files.filter(async data => {
        // For each data, remove if can't read folder
        transaction.logger.debug('Filtering file ' + data.fileId);
        return storage.fileHasReadPermission(transaction, data.dirId, transaction.info.userId);
    });

}