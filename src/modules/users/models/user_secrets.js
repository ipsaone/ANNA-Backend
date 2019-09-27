'use strict';

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');

const config = require(path.join(root, './src/config/config'));

const bcrypt = require('bcrypt');


const hashPassword = async (user) => {
    if (!user.changed('password')) {
        return user.getDataValue('password');
    }

    let hash = await bcrypt.hash(user.getDataValue('password'), config.password.salt)
    return user.setDataValue('password', hash);

};

module.exports = (sequelize, DataTypes) => {
    const UserSecrets = sequelize.define('UserSecrets', {
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
        UserSecrets.belongsTo(models.User, {
            as: 'user',
            foreignKey: 'secretsId',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });
    }

    return UserSecrets;
};