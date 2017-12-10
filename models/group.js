'use strict';

module.exports = (sequelize, DataTypes) => {
    const Group = sequelize.define('Group', {
        name: {
            allowNull: false,
            type: DataTypes.STRING
        }
    }, {timestamps: false});

    Group.associate = function (models) {
        Group.belongsToMany(models.User, {
            foreignKey: 'groupId',
            as: 'users',
            through: models.UserGroup,
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });
        Group.hasMany(models.Data, {
            as: 'files',
            foreignKey: 'groupId',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });
        Group.hasMany(models.Mission, {
            as: 'missions',
            foreignKey: 'groupId',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });
    };

    return Group;
};
