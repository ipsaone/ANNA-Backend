'use strict';

module.exports = (sequelize, DataTypes) => {
    const File = sequelize.define('File', {
        path: {allowNull: false, unique: true, type: DataTypes.STRING},
        ownerId: {allowNull: false, type: DataTypes.INTEGER},
        groupId: {allowNull: false, type: DataTypes.INTEGER},

        // Additional properties, filled by the Storage class, not saved on the database
        type: DataTypes.VIRTUAL,
        base: DataTypes.VIRTUAL,
        name: DataTypes.VIRTUAL,
        ext: DataTypes.VIRTUAL,
        size: DataTypes.VIRTUAL,
        mime: DataTypes.VIRTUAL,
    });

    File.associate = function (models) {
        File.belongsTo(models.User, {foreignKey: 'ownerId', as: 'owner'});
        File.belongsTo(models.Group, {foreignKey: 'groupId', as: 'group'});
    };

    return File;
};