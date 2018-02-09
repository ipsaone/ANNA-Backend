'use strict';


/**
 * @file Defines a model for 'Data' table in database and its associations with the other tables
 * @see {@link module:data}
 */

/**
 * @module data
 */

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');

require('dotenv').config();
const config = require(path.join(root, './config/config'));

const repo = require('../repository');


/**
 * @constant computeValues
 * @param {Object} data - Data.
 * @implements {getPath}
 * @returns {Promise} The promise to retur data path or an error.
 */
const computeValues = (data) => {
    const typeP = data.getPath()
        .then((dataPath) => repo.computeType(dataPath))
        .then((type) => {
            data.type = type;

            return true;
        })
        .catch(() => {
            data.type = '';

            return true;
        });

    const sizeP = data.getPath()
        .then((dataPath) => repo.computeSize(dataPath))
        .then((size) => {
            data.size = size;

            return true;
        })
        .catch(() => {
            data.size = -1;

            return true;
        });

    return Promise.all([
        sizeP,
        typeP
    ]);
};

/**
 * @function exports
 *
 * @param {Object} sequelize - The Sequelize object.
 * @param {Object} DataTypes - DataTypes.
 *
 * @returns {Object} Returns Data.
 *
 */
module.exports = (sequelize, DataTypes) => {

    /**
     * Defines a mapping between model and table 'Data'
     * @function Data
     *
     * @param {Obect} Data The table defined by the function
     *
     * @implements {name}
     * @implements {type}
     * @implements {size}
     * @implements {exists}
     * @implements {fileId}
     * @implements {dirId}
     * @implements {ownerId}
     * @implements {rightsId}
     * @implements {groupId}
     * @implements {isDir}
     * @implements {children}
     * @implements {timestamps}
     * @implements {hooks}
     * @implements {freezeTableName}
     *
     */
    const Data = sequelize.define('Data', {

        /**
         * @var {STRING} name
         */
        name: {
            allowNull: false,
            type: DataTypes.STRING
        },

        /**
         * @var {STRING} type
         */
        type: {
            allowNull: true,
            type: DataTypes.STRING
        },

        /**
         * @var {INTEGER} size
         */
        size: {
            allowNull: true,
            type: DataTypes.INTEGER
        },

        /**
         * @var {BOOLEAN} exists
         */
        exists: {
            allowNull: false,
            defaultValue: true,
            type: DataTypes.BOOLEAN
        },

        /**
         * @var {INTEGER} fileId
         */
        fileId: {
            allowNull: false,
            type: DataTypes.INTEGER
        },

        /**
         * @var {INTEGER} dirId
         */
        dirId: {
            allowNull: false,
            defaultValue: 1,
            type: DataTypes.INTEGER
        },

        /**
         * @var {INTEGER} ownerId
         */
        ownerId: {
            allowNull: false,
            type: DataTypes.INTEGER
        },

        /**
         * @var {INTEGER} rightsId
         */
        rightsId: {
            allowNull: false,
            type: DataTypes.INTEGER
        },

        /**
         * @var {INTEGER} groupId
         */
        groupId: {
            allowNull: false,
            type: DataTypes.INTEGER
        },

        /**
         * @var {BOOLEAN} hidden
         */
        hidden: {
            allowNull: false,
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        timestamps: true,
        paranoid: true,
        hooks: {
            beforeCreate: computeValues,
            beforeUpdate: computeValues
        },
        freezeTableName: true
    });


    /**
     * Associates Data to other tables.
     *
     * @function associate
     * @param {obj} db2 - The database.
     * @returns {Promise} The promise to create associations.
     */
    Data.associate = function (db2) {

        /**
         * Creates singular association with table 'File'
         * @function belongsToFile
         */
        Data.belongsTo(db2.File, {
            foreignKey: 'fileId',
            as: 'file',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        /**
         * Creates singular association with table 'User'
         * @function belongsToUser
         */
        Data.belongsTo(db2.User, {
            foreignKey: 'ownerId',
            as: 'author',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        /**
         * Creates singular association with table 'Right'
         * @function belongsToRight
         */
        Data.belongsTo(db2.Right, {
            foreignKey: 'rightsId',
            as: 'rights',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        /**
         * Createssingular  association with table 'Group'
         * @function belongsToGroup
         */
        Data.belongsTo(db2.Group, {
            foreignKey: 'groupId',
            as: 'group',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        /**
         * Creates singular association with table 'Data'
         * @function belongsToData
         */
        Data.belongsTo(db2.Data, {
            foreignKey: 'dirId',
            as: 'directory',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        /**
         * Creates plural associations with table 'Data'
         * @function hasManyData
         */
        Data.hasMany(db2.Data, {
            foreignKey: 'dirId',
            as: 'files',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

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


    return Data;
};
