'use strict';

const config = require('../config/config');
const bcrypt = require('bcryptjs');

let hashPassword = (user, options) => {
        if (!user.changed('password')) {
            return ;
        }

        return bcrypt.hash(user.getDataValue('password'), config.password.salt).then(hash => {7
            console.log(hash);
            user.setDataValue('password', hash);
            console.log(user.getDataValue('password'))
        });

    };

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        username: {allowNull: false, type: DataTypes.STRING, unique: true},
        email: {allowNull: false, type: DataTypes.STRING, unique: true},
        password: {
            allowNull: false,
            type: DataTypes.STRING,
        },
    }, {
        hooks: {
            beforeCreate: hashPassword,
            beforeUpdate: hashPassword
        }
    });

    User.associate = function (models) {
        User.hasMany(models.Post, {foreignKey: 'authorId', as: 'posts'});
        User.hasMany(models.File, {foreignKey: 'ownerId', as: 'files'});
        User.hasMany(models.Log, {foreignKey: 'authorId', as: 'logs'});
        User.belongsToMany(models.Group, {as: 'groups', through: models.UserGroup, foreignKey: 'userId'});
    };

    



    return User;
};