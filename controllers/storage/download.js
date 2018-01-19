'use strict';

const db = require.main.require('./models');
const policy = require.main.require('./policies/storage_policy');

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

module.exports = async (req, res) => {
    if (isNaN(parseInt(req.params.fileId, 10))) {
        return res.boom.badRequest();
    }
    const fileId = parseInt(req.params.fileId, 10);

    // Revision parameter, to get an older version
    let rev = 0;

    if (!isNaN(parseInt(req.query.revision, 10))) {
        rev = parseInt(req.query.revision, 10);
    }


    // Download parameter, to get file metadata or contents
    const dl = req.query.download && req.query.download === 'true';

    // Find the file in database
    const file = await db.File.findById(fileId);

    // Send back the correct response, file or json
    if (!file) {
        return res.boom.notFound();
    }

    const data = await file.getData(rev);


    if (!data) {
        return res.boom.notFound('This revision doesn\'t exist');
    }

    if (dl) {
        const allowed = await policy.filterDownloadContents(fileId, req.session.auth);

        if (!allowed) {
            return res.boom.unauthorized();
        }

        const path = await data.getPath(true);


        return res.download(path, data.name);
    }

    const allowed = await policy.filterDownloadMeta(fileId, req.session.auth);

    if (!allowed) {
        throw res.boom.unauthorized();
    }

    return res.json(data);
};
