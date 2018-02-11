'use strict';


const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');

require('dotenv').config();
const config = require(path.join(root, './config/config'));

module.exports.setupPrototype = function (Data, sequelize) {

    /**
     *
     * Get URL for a data object.
     * Is designed to be bound to the data object.
     *
     * @returns {string} Data URL.
     *
     */
    Data.prototype.getUrl = function () {
        let url = '/storage/files/';

        url += this.fileId;
        url += '?revision=';
        url += this.id;

        // Force return of a promise
        return Promise.resolve(url);
    };

    /**
     *
     * Get file system path for a data object.
     * Is designed to be bound to the data object.
     *
     * @function getPath
     *
     * @todo fix
     *
     *
     * @returns {string} Data path.
     *
     */
    Data.prototype.getPath = async function () {
        let dataPath = '';
        let id = 0;


        if (this.id) {
            id = this.id;
        } else if (sequelize.getDialect() === 'mysql') {

            /*
             * Get next ID by getting Auto_increment value of the table
             * ATTENTION : race condition here ?
             */
            const data = await sequelize.query('SHOW TABLE STATUS LIKE \'Data\'', {type: sequelize.QueryTypes.SELECT});

            if (!data || data.length !== 1) {
                throw new Error('Failed to find path');
            }
            id = data[0].Auto_increment;
        } else if (sequelize.getDialect() === 'sqlite') {

            // Simpler query for tests
            const data = await sequelize.query('SELECT * FROM \'Data\' ORDER BY id DESC LIMIT 1');

            if (!data || data.length !== 1) {
                throw new Error('Failed to find path');
            }
            id = data[0].id + 1;
        }

        dataPath += `/${this.fileId}`;
        dataPath += `/${this.name}-#${id}`;

        return Promise.resolve(path.join(config.storage.folder, dataPath));

    };

    /**
     *
     * Get rights for a data object.
     *
     * @param {obj} db - The database.
     * @returns {Object} Promise to rights.
     *
     */
    Data.prototype.getRights = function (db) {
        // Only one right should exist for each data, no check needed

        return db.Right.findById(this.rightsId);
    };
};
