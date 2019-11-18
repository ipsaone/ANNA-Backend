const async = require('async');
const util = require('util');
const getChildrenData = require('./list');

let searchInFolder = async (folder, searches, transaction) => {

    let db = transaction.db;
    let body = transaction.reqBody;

    let childrenData = await getChildrenData(folder, {foldersOnly: true}, transaction);
    let promises = [];
    for(let i = 0; i < childrenData.length; i++) {
        promises.push(searchInFolder(childrenData[i].fileId, searches, transaction));
    }
    let otherSearches = Promise.all(promises); // WILL BE AWAITED LATER

    const options = {
        [db.Sequelize.Op.and]: [
            {fileId: {[db.Sequelize.Op.ne] : 1}},
            {dirId: folder}, 
            {[db.Sequelize.Op.or]: searches}
        ]
    };
    transaction.logger.debug('Starting search', {folder: folder, options: JSON.stringify(options), searches: JSON.stringify(searches)});
    const matchingData = await db.Data.findAll({where: options});
    transaction.logger.debug('Search results', {matchingData});
    let filteredData;

    // If all data are requested, send everything we find
    if (body.include && 'previous_data' in body.include) {
        transaction.logger.debug('Sending all found data');
        filteredData = matchingData;
    } else {

        // Otherwise, filter data
        transaction.logger.debug('Filtering data')
        const filterPromise = util.promisify(async.filter);
        filteredData = await filterPromise(matchingData, async.asyncify(async (el) => {

            // Find the file corresponding to data
            transaction.logger.debug('finding file from data', {data: el.toJSON()})
            const file = await db.File.findByPk(el.fileId);
            if (!file) {
                transaction.logger.error('Couldn\t find file from data', {data: el.toJSON()})
                return false;
            }

            // Find the most recent data from the file
            transaction.logger.debug('Finding most recent data')
            const lastData = await file.getData(db);
            if (lastData.id !== el.id) {
                transaction.logger.debug('Last data id doesn\'t match this data id', {lastData: lastData.toJSON(), thisData: el.toJSON()})
                return false;
            }

            return true;

        }));
    }

    let otherResults = await otherSearches;
    for(let i = 0; i < otherResults.length; i++) {
        filteredData = filteredData.concat(otherResults[i]);
    }
    return filteredData;

}

module.exports = async (transaction) => {

    let body = transaction.reqBody;
    let db = transaction.db;
    
    // Find keyword in data
    transaction.logger.debug('Parsing searches')
    const searches = [];
    if(body.include && body.include.includes('name')) {
        transaction.logger.debug('Adding name search option')
        searches.push({name: {[db.Sequelize.Op.like]: `%${body.keyword}%`}});
    }
    if(body.include && body.include.includes('serialNbr')) {
        transaction.logger.debug('Adding serialNbr search option');
        searches.push({serialNbr: {[db.Sequelize.Op.like]: `%${body.keyword}%`}});
    }
    
    let folder = body.upperFolder ? body.upperFolder : 1;
    let search = await searchInFolder(folder, searches, transaction); 

    return search;
}