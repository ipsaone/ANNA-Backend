'use strict';

const policy = require('../storage_policy');

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
    if (isNaN(parseInt(req.params.fileId, 10))) {
        return res.boom.badRequest('File ID must be an integer');
    }
    const fileId = parseInt(req.params.fileId, 10);

    // Download parameter, to get file metadata or contents
    const dl = req.query.download && req.query.download === 'true';


    if (dl) {
        // Find the file in database
        const file = await db.File.findByPk(fileId);
        if (!file) {
            console.log("download failed for file :", fileId);
            return res.boom.notFound("file not found !");
        }

        // Revision parameter, to get an older version
        let rev = 0;

        if (!isNaN(parseInt(req.query.revision, 10))) {
            rev = parseInt(req.query.revision, 10);
        }

        const data = await file.getData(db, rev);

        if (!data) {
            return res.boom.notFound('This revision doesn\'t exist');
        }

        const allowed = await policy.filterDownloadContents(db, fileId, req.session.auth);

        if (!allowed) {
            return res.boom.unauthorized();
        }

        const dataPath = await data.getPath(true);


        return res.download(dataPath, data.name);
    }

    const allowed = await policy.filterDownloadMeta(db, fileId, req.session.auth);

    if (!allowed) {
        throw res.boom.unauthorized();
    }

    const data = await db.Data.findAll({
        where: {fileId},
        include: ['rights']
    });

    return res.status(200).json(data);
};
