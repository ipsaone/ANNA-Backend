'use strict';

const config = require('../config/config');
const bcrypt = require('bcrypt');
const Storage = require('../repositories/Storage');

let hashPassword = (user, options) => {
    if (!user.changed('password')) {
        return;
    }

    return bcrypt.hash(user.getDataValue('password'), config.password.salt)
        .then(hash => user.setDataValue('password', hash));

};

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        username: {allowNull: false, type: DataTypes.STRING, unique: true},
        email: {allowNull: false, type: DataTypes.STRING, unique: true},
        password: {allowNull: false, type: DataTypes.STRING},
    }, {
        hooks: {
            beforeCreate: hashPassword,
            beforeUpdate: hashPassword
        }
    });

    User.associate = function (models) {
        User.hasMany(models.Post, {foreignKey: 'authorId', as: 'posts'});
        User.hasMany(models.Data, {foreignKey: 'ownerId', as: 'files'});
        User.hasMany(models.Log, {foreignKey: 'authorId', as: 'logs'});
        User.belongsToMany(models.Group, {as: 'groups', through: models.UserGroup, foreignKey: 'userId'});
        User.belongsToMany(models.Log, {as: 'logs', through: models.LogUser, foreignKey: 'userId'});
        User.hasMany(models.Mission, {as: 'missions', foreignKey: 'leaderId'});
    };


    return User;
};