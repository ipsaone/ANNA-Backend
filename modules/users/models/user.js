'use strict';

/**
 * @file
 * @see {@link module:user}
 */

/**
 * @module user
 */

const config = require.main.require('./config/config');

/**
 * Requires the bcrypt package from nodeJS
 * @const bcrypt
 * @see {@link https://www.npmjs.com/package/bcrypt}
 */
const bcrypt = require('bcrypt');

/**
 * @function hashPassword
 * @param {Object} user - A user.
 * @returns {Promise} The promise to get the user's password.
 * @see {@link https://www.npmjs.com/package/password-hash}
 */
const hashPassword = (user) => {
    if (!user.changed('password')) {
        return user.getDataValue('password');
    }

    return bcrypt.hash(user.getDataValue('password'), config.password.salt)
        .then((hash) => user.setDataValue('password', hash));

};

/**
 * @function exports
 *
 * @param {Object} sequelize - The Sequelize object.
 * @param {Object} DataTypes - DataTypes.
 *
 * @returns {Object} Returns User.
 *
 */
module.exports = (sequelize, DataTypes) => {

    /**
     * Defines a mapping between model and table 'User'
     * @function User
     *
     * @param {Obect} User The table defined by the function
     *
     * @implements {username}
     * @implements {email}
     * @implements {password}
     * @implements {hooks}
     *
     */
    const User = sequelize.define('User', {

        /**
         * The username of the user
         * @var {STRING} username
         */
        username: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: true
        },

        /**
         * The email adress of the user
         * @var {STRING} email
         */
        email: {
            allowNull: false,
            type: DataTypes.STRING,
            unique: true
        },

        /**
         * The password of the user
         * @var {STRING} password
         */
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

    /**
     * Associates User to other tables.
     *
     * @function associate
     * @param {Object} models - This var regroups models of all tables.
     * @returns {Promise} The promise to create associations.
     */

    User.associate = function (models) {

        /**
         * Creates plural associations between tables 'User' and 'Group'
         * @function belongsToManyGroup
         */
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

        /**
         * Creates plural associations between tables 'User' and 'Post'
         * @function hasManyPost
         */
        User.hasMany(models.Post, {
            foreignKey: 'authorId',
            as: 'posts',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });

        /**
         * Creates plural associations between tables 'User and 'Data'
         * @function hasManyData
         */
        User.hasMany(models.Data, {
            foreignKey: 'ownerId',
            as: 'files',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });

        /**
         * Creates plural associations between tables 'User and 'Log'
         * @function hasManyLog
         */
        User.hasMany(models.Log, {
            foreignKey: 'authorId',
            as: 'logs',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });

        /**
         * Creates plural associations between tables 'User and 'Log'
         * @function belongsToManyLog
         */
        User.belongsToMany(models.Log, {
            as: 'userLogs',
            through: models.LogUser,
            foreignKey: 'userId'
        });

        /**
         * Creates plural associations between tables 'User and 'Mission'
         * @function hasManyMission
         */
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
