'use strict';


let computeValues = (data, options) => {
    const Storage = require('../repositories/Storage');

    data.getPath()
        .then(path => Storage.computeType(path))
        .then(type => data.setDataValue('type'));

    data.getPath()
        .then(path => data.computeSize(path))
        .then(size => data.setDataValue('size'));
};

module.exports = (sequelize, DataTypes) => {

    const Data = sequelize.define('Data', {
        name: {allowNull: false, type: DataTypes.STRING},
        type: {allowNull: true, type: DataTypes.STRING},
        size: {allowNull: true, type: DataTypes.INTEGER},
        exists: {allowNull: false, defaultValue: true, type: DataTypes.BOOLEAN},
        fileId: {allowNull: false, type: DataTypes.INTEGER},
        dirId: {allowNull: false, defaultValue: 1, type: DataTypes.INTEGER},
        ownerId: {allowNull: false, type: DataTypes.INTEGER},
        rightsId: {allowNull: false, type: DataTypes.INTEGER},
        groupId: {allowNull: false, type: DataTypes.INTEGER},
    }, {
        timestamps: true,
        hooks: {
            beforeCreate: computeValues,
            beforeUpdate: computeValues
        }
    });


    const Storage = require('../repositories/Storage');

    Data.prototype.getRights = Storage.getDataRights;
    Data.prototype.getPath = Storage.getDataPath;
    Data.prototype.getUrl = Storage.getDataUrl;

    Data.associate = function (models) {
        Data.belongsTo(models.File, {foreignKey: 'fileId', as: 'file'});
        Data.belongsTo(models.User, {foreignKey: 'ownerId', as: 'author'});
        Data.belongsTo(models.Right, {foreignKey: 'rightsId', as: 'rights'});
        Data.belongsTo(models.Group, {foreignKey: 'groupId', as: 'group'});

        Data.belongsTo(models.Data, {foreignKey: 'dirId', as: 'directory'});
        Data.hasMany(models.Data, {foreignKey: 'dirId', as: 'files'});
    };

    return Data;
};