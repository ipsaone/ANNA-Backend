'use strict';

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');

const config = require(path.join(root, './src/config/config'));


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
            allowNull: true,
            type: DataTypes.VIRTUAL
        },

        secretsId: {
            allowNull: false,
            type: DataTypes.INTEGER,
        }
    });

    let createSecretsHook = async (user, options) => {
        const secrets = await sequelize.models.UserSecrets.create({
            password: user.password
        });

        delete user.password;
        user.secretsId = secrets.id;
    };

    let removeSecretsHook = async  (user, options) => {
        let secrets = await user.getSecrets();
        await secrets.destroy();
    };

    // Maybe bulk hooks are needed ?
    User.addHook('beforeValidate', createSecretsHook);
    User.addHook('validationFailed', removeSecretsHook);



    User.associate = function (models) {

        User.belongsToMany(models.Group, {
            as: 'groups',
            through: models.UserGroup,
            foreignKey: 'userId',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });

        User.belongsToMany(models.Mission, {
            as: 'participatingMissions',
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
            as: 'leaderMissions',
            foreignKey: 'leaderId',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });

        User.hasOne(models.UserSecrets, {
            as: 'secrets',
            foreignKey: 'secretsId',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });
    };

    User.prototype.isRoot = async function () {
        const groups = await this.getGroups();
        return groups.find((group) => group.name === 'root');

    };


    return User;
};
