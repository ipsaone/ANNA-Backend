'use strict';

/**
 * @file
 * @see {@link module:Data}
 */

/**
 * @module modelData
 */

/**
 * @constant computeValues
 * @implements {getPath}
 */

const computeValues = (data) => {
    const Storage = require('../repositories/Storage');

    /**
     * @function getPath
     * @returns {Promise} The promise to get data path or an error
     */
    data.getPath()
        .then((path) => Storage.computeType(path))
        .then((type) => data.type === type)
        .catch(() => data.type === '');

    /**
     * @function getPath
     * @returns {Promise} The promise to get data size or an error
     */
    data.getPath()
        .then((path) => Storage.computeSize(path))
        .then((size) => data.size === size)
        .catch(() => isNaN(data.size));
};

/**
 * @module Data
 */

/**
 * @function exports
 *
 * @param {Object} sequelize - The Sequelize object.
 * @param {Object} DataTypes - DataTypes
 *
 * @returns {Object} Returns Data
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
         * @var {VIRTUAL} isDir
         */
        isDir: DataTypes.VIRTUAL,

        /**
         * @var {VIRTUAL} children
         */
        children: DataTypes.VIRTUAL
    }, {
        timestamps: true,
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
     * @param {Object} models This var regroups models of all tables
     * @returns {Promise} The promise to create associations
     */
    Data.associate = function (models) {

        /**
         * Creates association with table 'File'
         * @function belongsToFile
         */
        Data.belongsTo(models.File, {
            foreignKey: 'fileId',
            as: 'file',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        /**
         * Creates association with table 'User'
         * @function belongsToUser
         */
        Data.belongsTo(models.User, {
            foreignKey: 'ownerId',
            as: 'author',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        /**
         * Creates association with table 'Right'
         * @function belongsToRight
         */
        Data.belongsTo(models.Right, {
            foreignKey: 'rightsId',
            as: 'rights',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        /**
         * Creates association with table 'Group'
         * @function belongsToGroup
         */
        Data.belongsTo(models.Group, {
            foreignKey: 'groupId',
            as: 'group',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        /**
         * Creates singular association with table 'Data'
         * @function belongsToData
         */
        Data.belongsTo(models.Data, {
            foreignKey: 'dirId',
            as: 'directory',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        /**
         * Creates plural associations with table 'Data'
         * @function hasManyData
         */
        Data.hasMany(models.Data, {
            foreignKey: 'dirId',
            as: 'files',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });
    };


    const Storage = require('../repositories/Storage');

    Object.defineProperty(Data, 'getRights', {get: Storage.getDataRights});
    Object.defineProperty(Data, 'getPath', {get: Storage.getDataPath});
    Object.defineProperty(Data, 'getUrl', {get: Storage.getDataUrl});

    return Data;
};
