'use strict';

module.exports = (sequelize, DataTypes) => {
    const Data = sequelize.define('Data', {
        name: {allowNull: false, type: DataTypes.STRING},
        type: {allowNull: true, type: DataTypes.STRING},
        fileId: {allowNull: false, type: DataTypes.INTEGER},
        dirId: {allowNull: false, default: 0, type: DataTypes.INTEGER},
        ownerId: {allowNull: false, type: DataTypes.INTEGER},
        rightsId: {allowNull: false, type: DataTypes.INTEGER},
        groupId: {allowNull: false, type: DataTypes.INTEGER},
    });

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