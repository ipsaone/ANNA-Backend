'use strict';

const policy = require('../storage_policy');
const winston = require('winston');

module.exports = (db) => async (req, res) => {
    const fileId = parseInt(req.params.fileId, 10);

    // Download parameter, to get file metadata or contents
    const dl = req.query.download && req.query.download === 'true';
    if (dl) {

        req.transaction.logger.debug('Starting file download routine');

        // Find the file in database
        const file = await db.File.findByPk(fileId);
        if (!file) {
            req.transaction.logger.info("download failed", {fileId: fileId});
            return res.boom.notFound("file not found !");
        }

        // Revision parameter, to get an older version
        let rev = 0;
        if (!isNaN(parseInt(req.query.revision, 10))) {
            rev = parseInt(req.query.revision, 10);
            req.transaction.logger.debug('Successfully parsed revision request', {revision : rev});
        }

        req.transaction.logger.debug('Requesting target data', {revision: rev})
        const data = await file.getData(db, rev);
        if (!data) {
            winston
            return res.boom.notFound('This revision doesn\'t exist');
        }

        req.transaction.logger.debug('Checking policy');
        const allowed = await policy.filterDownloadContents(req.transaction, fileId, req.session.auth);
        if (!allowed) {
            req.transaction.logger.info('Download request refused by policy');
            return res.boom.unauthorized();
        }

        req.transaction.logger.debug('Requesting data path');
        const dataPath = await data.getPath(true);
        req.transaction.logger.debug('Data path request successful', {path: dataPath});

        req.transaction.logger.info('Sending file', {data: data.name});
        return res.download(dataPath, data.name);
    } else {

        req.transaction.logger.info('Starting metadata download routine');

        req.transaction.logger.debug('Checking policy')
        const allowed = await policy.filterDownloadMeta(req.transaction, fileId, req.session.auth);
        if (!allowed) {
            req.transaction.logger.info('Metadata download refused by policy');
            throw res.boom.unauthorized();
        }

        req.transaction.logger.debug('Requesting corresponding data');
        const data = await db.Data.findAll({
            where: {fileId},
            include: ['rights']
        });

        req.transaction.logger.info('Sending metadata', {data: data.map(e => e.toJSON())})
        return res.status(200).json(data);

    }
};
