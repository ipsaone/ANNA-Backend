/* eslint no-invalid-this: "warn", max-lines: "warn" */

'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const mmm = require('mmmagic');
const Magic = mmm.Magic;
const magic = new Magic(mmm.MAGIC_MIME_TYPE);


class Storage {

/**
 *
 * Get root Storage path. in file system.
 *
 * @returns {string} storage path
 *
 */
    static get root () {
        return path.join(__dirname, '..', config.storage.folder);
    }

    /**
     *
     * Get base url for storage requests.
     *
     * @returns {string} Storage url.
     *
     */
    static get baseUrl () {
        let conf = config.env.prod;

        if (process.env.DEV) {
            conf = config.env.dev;
        }


        return `https://${conf.host}:${conf.port}/storage`;
    }
}

module.exports = Storage;


/**
 *
 * Compute type for a file path.
 *
 * @param {object} filePath the file to compute size
 *
 * @returns {object} promise to file type
 *
 */
Storage.computeType = function (filePath) {
    return new Promise((resolve) => {
        magic.detectFile(filePath, (err, res) => {
            if (err) {
                throw err;
            }

            resolve(res);

        });
    });


};

/**
 *
 * Compute size for a file path
 *
 * @param {Object} filePath the file to compute size
 *
 * @returns {Object} promise to file size
 *
 */
Storage.computeSize = function (filePath) {
    return new Promise((resolve) => {
        fs.stat(filePath, (err, res) => {
            if (err) {
                throw err;
            } else {

                // Return file size
                resolve(res.size);
            }
        });
    });
};
