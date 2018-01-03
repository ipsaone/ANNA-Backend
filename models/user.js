'use strict';

const config = require('../config/config');
const bcrypt = require('bcrypt');

const hashPassword = (user) => {
    if (!user.changed('password')) {
        return user.getDataValue('password');
    }

    return bcrypt.hash(user.getDataValue('password'), config.password.salt)
        .then((hash) => user.setDataValue('password', hash));

};

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        username: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: true
        },
        email: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: true
        },
        password: {
            allowNull: false,
            type: DataTypes.STRING
        }
    }, {
        hooks: {
            beforeCreate: hashPassword,
            beforeUpdate: hashPassword
        }
    });

    User.associate = function (models) {
        User.belongsToMany(models.Group, {
            as: 'groups',
            through: models.UserGroup,
            foreignKey: 'userId',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        User.belongsToMany(models.Mission, {
            as: 'ParticipatingMissions',
            through: models.UserMission,
            foreignKey: 'userId',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        User.belongsToMany(models.Event, {
            as: 'events',
            through: models.EventUser,
            foreignKey: 'userId',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        User.hasMany(models.Post, {
            foreignKey: 'authorId',
            as: 'posts',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });
        User.hasMany(models.Data, {
            foreignKey: 'ownerId',
            as: 'files',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });
        User.hasMany(models.Log, {
            foreignKey: 'authorId',
            as: 'logs',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });

        User.belongsToMany(models.Log, {
            as: 'userLogs',
            through: models.LogUser,
            foreignKey: 'userId'
        });
        User.hasMany(models.Mission, {
            as: 'LeaderMissions',
            foreignKey: 'leaderId',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });
    };

    User.prototype.isRoot = async function () {
        const groups = await this.getGroups();

        if (groups.find((group) => group.name === 'root')) {
            return true;
        }

        return false;

    };


    return User;
};
