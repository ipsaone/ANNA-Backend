x'use strict';

const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        username: {allowNull: false, type: DataTypes.STRING, unique: true},
        email: {allowNull: false, type: DataTypes.STRING, unique: true},
        password: {
            allowNull: false,
            type: DataTypes.STRING,
            set (val) {
                this.setDataValue('password', bcrypt.hashSync(val));
            }
        }
    });

    User.associate = function (models) {
        User.hasMany(models.Post, {foreignKey: 'authorId', as: 'posts'});
        User.hasMany(models.File, {foreignKey: 'ownerId', as: 'files'});
        User.hasMany(models.Log, {foreignKey: 'authorId', as: 'logs'});
        User.belongsToMany(models.Group, {as: 'groups', through: models.UserGroup, foreignKey: 'userId'});
    };

    let hashPassword = (user, options) => {
        return bcrypt.hash(val).then(hash => user.setDataValue('password', user.password));
    }

    User.beforeCreate(hashPassword);
    User.beforeUpdate(hashPassword);


    return User;
};