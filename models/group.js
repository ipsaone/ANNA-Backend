'use strict';

module.exports = (sequelize, DataTypes) => {
    const Group = sequelize.define('Group', {
        name: {allowNull: false, type: DataTypes.STRING}
    }, {
        timestamps: false
    });

    Group.associate = function (models) {
        Group.hasMany(models.File, {foreignKey: 'groupId', as: 'files'});
        Group.belongsToMany(models.User, {as: 'users', through: models.UserGroup, foreignKey: 'groupId'});
    };

    return Group;
};