'use strict';

module.exports = (sequelize, DataTypes) => {
    const File = sequelize.define('File', {
        name: {allowNull: false, type: DataTypes.STRING},
        path: {allowNull: false, type: DataTypes.STRING},
        authorId: {allowNull: false, type: DataTypes.INTEGER},
        groupId: DataTypes.INTEGER // Group is optional
    });

    File.associate = function (models) {
        File.belongsTo(models.User, {foreignKey: 'ownerId', as: 'owner'});
        File.belongsTo(models.Group, {foreignKey: 'groupIDd', as: 'group'});
    };

    return File;
};