'use strict';


require('dotenv').config();

const repo = require('../repository');
const dataRep = require('../repository/data');


const computeValues = async (data, transaction) => {
    transaction.logger.info("Finding file path");
    const path = await data.getPath();

    transaction.logger.info("Finding data file");
    let file = await data.getFile();

    if(file.isDir) {
        transaction.logger.info("File is a directory, setting size and type as default");
        data.size = -1;
        data.type = 'folder';
        return data;
    }
    
    if(!data.exists) {
        transaction.logger.info("File is said not to exist, Not touching size/type (computed in models/file/addData)");
        return data;
    }

    transaction.logger.info("Starting computations");
    const typeP = repo.computeType(path);
    const sizeP = repo.computeSize(path);

    try {
        data.type = await typeP;
        transaction.logger.info("Type deduced correctly");
    } catch (err) {
        data.type = '';
        transaction.logger.info("Exception while deducing type");
    }

    try {
        data.size = await sizeP;
        transaction.logger.info("Size deduced correctly");
    } catch (err) {
        data.size = -1;
        transaction.logger.info("Exception while deducing size");
    }

    return data;
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

        hidden: {
            allowNull: false,
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },

        serialNbr: {
            allowNull: true,
            type: DataTypes.STRING,
            defaultValue: ''
        },

        creatorId: {
            allowNull: false,
            type: DataTypes.INTEGER
        },

        sha1: {
            allowNull: true,
            type: DataTypes.STRING
        }
    }, {
        timestamps: true,
        paranoid: true,
        freezeTableName: true
    });


    Data.associate = function (db2) {

        Data.belongsTo(db2.File, {
            foreignKey: 'fileId',
            as: 'file',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        Data.belongsTo(db2.User, {
            foreignKey: 'ownerId',
            as: 'author',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        Data.belongsTo(db2.Right, {
            foreignKey: 'rightsId',
            as: 'rights',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        Data.belongsTo(db2.Group, {
            foreignKey: 'groupId',
            as: 'group',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        Data.belongsTo(db2.Data, {
            foreignKey: 'dirId',
            as: 'directory',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        Data.hasMany(db2.Data, {
            foreignKey: 'dirId',
            as: 'files',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        dataRep.setupPrototype(Data, sequelize);
    };

    // Must be kept as an old-school function to use 'this'
    Data.prototype.computeValues = function(transaction) {return computeValues(this, transaction)};


    return Data;
};
