'use strict';

module.exports = (sequelize, DataTypes) => {
    const Group = sequelize.define('Group', {
        name: {allowNull: false, type: DataTypes.STRING}
    }, {
        timestamps: false
    });

    Group.associate = function (models) {
        Group.hasMany(models.Data, {foreignKey: 'groupId', as: 'files', onDelete: 'SET NULL', onUpdate: 'CASCADE'});
        Group.belongsToMany(models.User, {through: models.UserGroup, foreignKey: 'groupId', as: 'users', onDelete: 'SET NULL', onUpdate: 'CASCADE'});
        Group.hasMany(models.Mission, {foreignKey: 'groupId', as: 'missions', onDelete: 'SET NULL', onUpdate: 'CASCADE'})
    };

    return Group;
};
