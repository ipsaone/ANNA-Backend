'use strict';

/**
 * @file Defines a model for 'File' table in database and its associations with the other tables
 * @see {@link module:file}
 */

/**
 * @module file
 */

/**
 * Defines a mapping between model and table 'File'
 * @function exports
 *
 * @param {Object} sequelize - The Sequelize object.
 * @param {Object} DataTypes - DataTypes
 *
 * @returns {Object} Returns File
 *
 */

module.exports = (sequelize, DataTypes) => {
    const File = sequelize.define('File', {
        isDir: {
            allowNull: false,
            type: DataTypes.BOOLEAN
        }
    }, {
        timestamps: true,
        paranoid: true,
        scopes: {
            files: {where: {isDir: false}},
            folders: {where: {isDir: true}}
        }
    });

    /**
     * Files are saved in '../repositories/Storage'
     */
    const Storage = require('../repositories/Storage');

    /**
     * Associates File to other tables.
     *
     * @function associate
     * @param {Object} models - This var regroups models of all tables.
     * @returns {Promise} The promise to create associations.
     */
    File.associate = function (models) {

        /**
         * Creates singular association with table 'User'
         * @function belongsToUser
         */
        File.belongsTo(models.User, {
            foreignKey: 'ownerId',
            as: 'owner'
        });

        /**
         * Creates singular association with table 'Group'
         * @function belongsToGroup
         */
        File.belongsTo(models.Group, {
            foreignKey: 'groupId',
            as: 'group'
        });

        /**
         * Creates plural associations with table 'Log'
         * @function belongsToManyLog
         */
        File.belongsToMany(models.Log, {
            as: 'fileLogs',
            through: models.FileLog,
            foreignKey: 'userId'
        });
    };

    File.prototype.getData = Storage.getFileData;
    File.prototype.getDirTree = Storage.getFileDirTre;
    File.prototype.addData = Storage.addFileData;

    File.createNew = Storage.createNewFile;

    return File;
};
