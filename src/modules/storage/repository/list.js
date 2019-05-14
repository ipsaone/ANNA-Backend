module.exports = async (folderId, options, transaction) => {
    let db = transaction.db;
    transaction.logger.debug('getChildrenData called', {folderId, options});

    let file = db.File;
    if (options.filesOnly) {
        transaction.logger.debug('Scoping to files only');
        file = file.scope('files');
    } else if (options.foldersOnly) {
        transaction.logger.debug('Scoping to folders only');
        file = file.scope('folders');
    }

    transaction.logger.debug('Requesting all files')
    let files = {};
    try {
        files = await file.findAll();
    } catch (err) {
        transaction.logger.error("Couldn't retrieve files list from db", {err});
        return [];
    }

    transaction.logger.debug('Getting last data where real file exists for each file')
    let data = await Promise.all(files.map(async (thisFile) => {
        const d = await thisFile.getData(db);
        if (!d) {
            transaction.logger.debug('getData failed, returning empty object', {thisFile : thisFile.toJSON()})
            return {};
        }

        let thisData = d.toJSON();
        thisData.isDir = thisFile.isDir;


        // Find previous data where the file exists
        // Extract file size and type from there (for display only !)
        transaction.logger.debug("Iterating on data to find last existing file", {thisFile : thisFile.toJSON()});
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
                transaction.logger.error('Infinite loop while extracting previous data size/type', {thisFile : thisFile.toJSON()})
                throw new error('Infinite loop while extracting previous data size/type');
            }
        };


        return thisData;
        
        
    }));

    transaction.logger.debug('Filtering data');
    data = data.filter((item) => item.dirId === folderId);
    data = data.filter((item) => item.fileId !== 1);

    transaction.logger.debug('Returning found data', {data});
    return data;

};
