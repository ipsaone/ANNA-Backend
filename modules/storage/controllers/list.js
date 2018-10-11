'use strict';

const policy = require('../storage_policy');

const getChildrenData = async (db, folderId, options) => {

    let file = db.File;
    if (options.filesOnly) {
        file = file.scope('files');
    } else if (options.foldersOnly) {
        file = file.scope('folders');
    }

    let files = await file.findAll();

    let data = await Promise.all(files.map(async (thisFile) => {
        const d = await thisFile.getData(db);
        if (!d) {
            return {};
        }

        
        let thisData = d.toJSON();
        thisData.isDir = thisFile.isDir;


        // Find previous data where the file exists
        // Extract file size and type from there (for display only !)
        let i = 0, prevData = {};
        while(prevData = await thisFile.getData(db, i)) {
            if(!prevData) {
                break;
            }

            if(prevData.exists && prevData.size && prevData.type) {
                thisData.size = prevData.size;
                thisData.type = prevData.type;
            }

            i++;

            if(i>1e6) {
                throw new error('Infinite loop while extracting previous data size/type');
            }
        };


        return thisData;
        
        
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

    const childrenDataP = getChildrenData(db, folderId, req.query);
    const folderFileP = db.File.findOne({
        where: {id: folderId},
        rejectOnEmpty: true
    });

    const authorized = policy.filterList(db, folderId, req.session.auth);

    if (!authorized) {
        return res.boom.unauthorized();
    }

    const folderFile = await folderFileP;


    const dirTreeP = folderFile.getDirTree(db);
    const folderData = await folderFile.getData(db);

    if(!folderData) {
        return res.boom.internal();
    }

    const response = folderData.toJSON();

    response.isDir = folderFile.isDir;
    response.dirTree = await dirTreeP;
    response.children = await childrenDataP;

    return res.status(200).json(response);
};
