'use strict';


const storage = require('./repository/storage');

exports.filterList = async (db, folderId, userId) =>

    
    storage.fileHasReadPermission(db, folderId, userId);


exports.filterUploadNew = async (db, folderId, userId) => {

    const canWriteP = storage.fileHasWritePermission(db, folderId, userId);
    const folder = await db.File.findByPk(folderId);
    const canWrite = await canWriteP;

    if (!folder) {
        console.log(`no folder #${folderId}`);

        return false;
    }

    return canWrite && folder.isDir;

};

exports.filterUploadRev = async (db, fileId, userId) => {

    

    const file = await db.File.findByPk(fileId);

    if (!file) {
        console.log(`File not found : #${fileId}`);

        return false;
    }

    const lastData = await file.getData(db);

    if (!lastData) {
        console.log(`No data for file #${fileId}`);
    }


    return storage.fileHasWritePermission(db, lastData.dirId, userId);

};

exports.filterDownloadMeta = async (db, fileId, userId) => {

    const file = await db.File.findByPk(fileId);

    if (!file) {
        console.log(`No file with id ${fileId}`);

        return false;
    }

    const lastData = await file.getData(db);

    if (!lastData) {
        console.log(`No data for file #${fileId}`);
    }

    return storage.fileHasReadPermission(db, lastData.dirId, userId);

};

exports.filterDownloadContents = async (db, fileId, userId) => {

    const file = await db.File.findByPk(fileId);

    if (file.isDir) {
        return false;
    }

    return storage.fileHasReadPermission(db, fileId, userId);
};

exports.filterDelete = async (db, fileId, userId) => {

    if(fileId == 1) {
        return false;
    }

    console.log('filtering deletion for file ', fileId);

    // Check if directory has 'write' permission
    const file = await db.File.findByPk(fileId);
    if (!file) {
        return false;
    }


    const lastData = await file.getData(db);
    if (!lastData) {
        console.log(`No data for file #${fileId}`);
    }


    return storage.fileHasWritePermission(db, lastData.dirId, userId);
};
