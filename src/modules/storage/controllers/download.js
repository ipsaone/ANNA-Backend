'use strict';

const policy = require('../storage_policy');
const winston = require('winston');

/**
 *
 * Download a file or its metadata.
 *
 * @param {obj} req     - The user request.
 * @param {obj} res     - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 */

module.exports = (db) => async (req, res) => {
    const fileId = parseInt(req.params.fileId, 10);

    // Download parameter, to get file metadata or contents
    const dl = req.query.download && req.query.download === 'true';
    if (dl) {

        winston.debug('Starting file download routine');

        // Find the file in database
        const file = await db.File.findByPk(fileId);
        if (!file) {
            winston.info("download failed", {fileId: fileId});
            return res.boom.notFound("file not found !");
        }

        // Revision parameter, to get an older version
        let rev = 0;
        if (!isNaN(parseInt(req.query.revision, 10))) {
            rev = parseInt(req.query.revision, 10);
            winston.debug('Successfully parsed revision request', {revision : rev});
        }

        winston.debug('Requesting target data', {revision: rev})
        const data = await file.getData(db, rev);
        if (!data) {
            winston
            return res.boom.notFound('This revision doesn\'t exist');
        }

        winston.debug('Checking policy');
        const allowed = await policy.filterDownloadContents(db, fileId, req.session.auth);
        if (!allowed) {
            winston.info('Download request refused by policy');
            return res.boom.unauthorized();
        }

        winston.debug('Requesting data path');
        const dataPath = await data.getPath(true);
        winston.debug('Data path request successful', {path: dataPath});

        winston.info('Sending file', {data: data.name});
        return res.download(dataPath, data.name);
    }

    winston.info('Starting metadata download routine');

    winston.debug('Checking policy')
    const allowed = await policy.filterDownloadMeta(db, fileId, req.session.auth);
    if (!allowed) {
        winston.info('Metadata download refused by policy');
        throw res.boom.unauthorized();
    }

    winston.debug('Requesting corresponding data');
    const data = await db.Data.findAll({
        where: {fileId},
        include: ['rights']
    });

    winston.info('Sending metadata', {data: data})
    return res.status(200).json(data);
};
