'use strict';

module.exports = (sequelize, DataTypes) => {
    const Group = sequelize.define('Group', {
        name: {allowNull: false, type: DataTypes.STRING}
    }, {
        timestamps: false,
        tableName: 'Group'
    });

    Group.associate = function (models) {
        Group.belongsToMany(models.User, {through: models.UserGroup, foreignKey: 'groupId', as: 'users', onDelete: 'RESTRICT', onUpdate: 'CASCADE'});
        Group.hasMany(models.Data, {foreignKey: 'groupId', as: 'files', onDelete: 'RESTRICT', onUpdate: 'CASCADE'});
        Group.hasMany(models.Mission, {foreignKey: 'groupId', as: 'missions', onDelete: 'RESTRICT', onUpdate: 'CASCADE'})
    };

    return Group;
};
