'use strict';

const storage = require('../repositories/storage');
const db = require('../models');


exports.filterList = (folderId, userId) =>
    // Check if directory has 'read' permission
    storage.fileHasReadPermission(folderId, userId);

exports.filterUploadNew = (folderId, userId) =>
    // Check if directory has 'write' permission
    storage.fileHasWritePermission(folderId, userId);

exports.filterUploadRev = async (fileId, userId) => {

    /*
     * Check if directory has 'write' permission for metadata update
     * Check if file has 'write' permission for file update
     */

    const file = await db.File.findById(fileId);


    return storage.fileHasWritePermissions(file.dirId, userId);

};

exports.filterDownload = async (fileId, userId) => {

    /*
     * Check if directory has 'read' permissions for metadata download
     * Check if file has 'read' permission for file download
     */

    const file = await db.File.findById(fileId);


    return storage.fileHasReadPermissions(file.dirId, userId);

};

exports.filterDelete = (folderId, userId) =>
    // Check if directory has 'write' permission
    storage.fileHasWritePermission(folderId, userId);
