'use strict';

const Storage = require('../repositories/Storage');
const fs = require('fs');

require('dotenv').config();
const config = require('../config/config');
const path = require('path');

const computeValues = (data) => {
    data.getPath()
        .then((dataPath) => Storage.computeType(path.join('..', config.storage.folder, dataPath)))
        .then((type) => {
            data.type = type;

            return true;
        })
        .catch(() => {
            data.type = '';

            return true;
        });

    data.getPath()
        .then((dataPath) => Storage.computeSize(path.join('..', config.storage.folder, dataPath)))
        .then((size) => {
            data.size = size;

            return true;
        })
        .catch(() => {
            data.size = -1;

            return true;
        });
};

module.exports = (sequelize, DataTypes) => {

    const Data = sequelize.define('Data', {
        name: {
            allowNull: false,
            type: DataTypes.STRING
        },
        type: {
            allowNull: true,
            type: DataTypes.STRING
        },
        size: {
            allowNull: true,
            type: DataTypes.INTEGER
        },
        exists: {
            allowNull: false,
            defaultValue: true,
            type: DataTypes.BOOLEAN
        },
        fileId: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        dirId: {
            allowNull: false,
            defaultValue: 1,
            type: DataTypes.INTEGER
        },
        ownerId: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        rightsId: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        groupId: {
            allowNull: false,
            type: DataTypes.INTEGER
        },

        isDir: DataTypes.VIRTUAL,
        children: DataTypes.VIRTUAL
    }, {
        timestamps: true,
        paranoid: true,
        hooks: {
            beforeCreate: computeValues,
            beforeUpdate: computeValues
        },
        freezeTableName: true
    });


    Data.associate = function (models) {
        Data.belongsTo(models.File, {
            foreignKey: 'fileId',
            as: 'file',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });
        Data.belongsTo(models.User, {
            foreignKey: 'ownerId',
            as: 'author',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });
        Data.belongsTo(models.Right, {
            foreignKey: 'rightsId',
            as: 'rights',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });
        Data.belongsTo(models.Group, {
            foreignKey: 'groupId',
            as: 'group',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        Data.belongsTo(models.Data, {
            foreignKey: 'dirId',
            as: 'directory',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });
        Data.hasMany(models.Data, {
            foreignKey: 'dirId',
            as: 'files',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });
    };


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
     * @todo fix
     *
     * @param {bool} full - Get full path or relative path.
     *
     * @returns {string} data path
     *
     */
    Data.prototype.getPath = function (full = false) {
        let dataPath = '';

        if (full) {
            dataPath += Storage.root;
        }
        dataPath += `/${this.fileId}`;
        dataPath += `/${this.id}`;
        dataPath += `-${this.name}`;

        console.log(dataPath);

        // Check file exists
        fs.access(dataPath, fs.constants.F_OK, (err) => {
            if (err) {
                return Promise.reject(err);
            }


            // Return file path if it exists
            return Promise.resolve(dataPath);

        });

    };

    /**
     *
     * Get rights for a data object.
     *
     * @returns {Object} Promise to rights.
     *
     */
    Data.prototype.getRights = function () {
        const db = require('../models');

        // Only one right should exist for each data, no check needed
        return db.Right.findOne({where: {id: this.rightsId}});
    };

    return Data;
};
