'use strict';

const fs = require('fs');

require('dotenv').config();
const config = require('../config/config');
const path = require('path');
const mmm = require('mmmagic');
const Magic = mmm.Magic;
const magic = new Magic(mmm.MAGIC_MIME_TYPE);


/**
 *
 * Compute type for a file path.
 *
 * @param {object} filePath the file to compute size
 *
 * @returns {object} promise to file type
 *
 */
const computeType = function (filePath) {
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
const computeSize = function (filePath) {
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


const computeValues = (data) => {
    const typeP = data.getPath()
        .then((dataPath) => computeType(dataPath))
        .then((type) => {
            data.type = type;

            return true;
        })
        .catch(() => {
            data.type = '';

            return true;
        });

    const sizeP = data.getPath()
        .then((dataPath) => computeSize(dataPath))
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
    Data.prototype.getPath = async function () {
        let dataPath = '';

        const count = await Data.count({where: {fileId: this.fileId}});

        dataPath += `/${this.fileId}`;
        dataPath += `/${this.name}-v${count + 1}`;

        return Promise.resolve(path.join(config.storage.folder, dataPath));

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
        return db.Right.findById(this.rightsId);
    };

    return Data;
};
