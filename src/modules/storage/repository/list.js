module.exports = async (folderId, options, transaction) => {
    let db = transaction.db;
    transaction.logger.debug('getChildrenData called', {folderId, options});

    let file_filter = {};
    if (options.filesOnly) {
        transaction.logger.debug('Scoping to files only');
        file_filter.isDir = true;
    } else if (options.foldersOnly) {
        transaction.logger.debug('Scoping to folders only');
        file_filter.isDir = false;
    }
    
    // https://stackoverflow.com/questions/48514254
    // Find the IDs of the latest data for each file
    let LatestFiles = await db.Data.findAll({attributes: ["id", db.sequelize.fn("max", db.sequelize.col('createdAt'))], group: ["fileId"]});
    transaction.logger.debug("latestFiles", JSON.stringify(LatestFiles));

    // Get the data and include all the needed info
    let data = await db.Data.findAll({ 
        where: { dirId: folderId, id: {[db.Sequelize.Op.in]: LatestFiles.map(x => x.id)} }, 
        include: [{model: db.File, where: { ...file_filter, deletedAt: null, id: {[db.Sequelize.Op.ne]: 1} }, as: "file"}] 
    });    

    transaction.logger.debug("data", JSON.stringify(data));

    transaction.logger.debug('Returning found data', {data});
    return data;

};
