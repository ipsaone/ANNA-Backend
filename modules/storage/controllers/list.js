'use strict';

const policy = require('../storage_policy');

const getChildrenData = async (db, folderId) => {
    let files = await db.File.findAll();

    if (!files.map((item) => item.id).includes(folderId)) {
        files = [];
    }

    let data = await Promise.all(files.map(async (thisFile) => {
        const d = await thisFile.getData(db);
        let thisData = d.toJSON();

        if (!thisData) {
            return {};
        } else {
            thisData.isDir = thisFile.isDir;
            return thisData;
        }
        
    }));


    data = data.filter((item) => item.dirId === folderId);
    data = data.filter((item) => item.fileId !== 1);

    return data;

};

/**
 *
 * List contents of a folder.
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 */

module.exports = (db) => async (req, res) => {
    // Fail if the folder isn't defined
    if (!req.params.folderId || isNaN(parseInt(req.params.folderId, 10))) {
        throw res.boom.badRequest();
    }
    const folderId = parseInt(req.params.folderId, 10);
    const file = db.File;

    if (req.query.filesOnly) {
        file.scope('files');
    } else if (req.query.foldersOnly) {
        file.scope('folders');
    }

    const childrenDataP = getChildrenData(db, folderId);
    const folderFileP = db.File.findOne({
        where: {id: folderId},
        rejectOnEmpty: true
    });

    const authorized = policy.filterList(db, folderId, req.session.auth);

    if (!authorized) {
        throw res.boom.unauthorized();
    }

    const folderFile = await folderFileP;


    const dirTreeP = folderFile.getDirTree(db);
    const folderData = await folderFile.getData(db);

    const response = folderData.toJSON();

    response.isDir = folderFile.isDir;
    response.dirTree = await dirTreeP;
    response.children = await childrenDataP;

    return res.status(200).json(response);
};
