'use strict';

/**
 * @file Defines a model for 'Log' table in database and its associations with the other tables
 * @see {@link module:log}
 */

/**
 * @module log
 */

const marked = require('marked');

/**
 * Defines a mapping between model and table 'File'.
 *
 * @function exports
 *
 * @param {Object} sequelize - The Sequelize object.
 * @param {Object} DataTypes - DataTypes.
 *
 * @returns {Object} Returns Log.
 *
 */
module.exports = (sequelize, DataTypes) => {

    /**
     * Defines a mapping between model and table 'Log'
     * @function Log
     *
     * @param {Obect} Log The table defined by the function
     *
     * @implements {title}
     * @implements {content}
     * @implements {authorId}
     *
     */
    const Log = sequelize.define('Log', {

        /**
         * The title of the log
         * @var {STRING} title
         */
        title: {
            allowNull: false,
            type: DataTypes.STRING
        },
        markdown: {
            allowNull: false,
            type: DataTypes.TEXT,
            set (val) {
                this.setDataValue('markdown', val); // Set this field with the raw markdown
                this.setDataValue('content', marked(val));
            }
        },

        /**
         * The content seen by the user
         * @var {TEXT} content
         */
        content: {
            allowNull: false,
            type: DataTypes.TEXT
        },

        /**
         * The id of the author of the log
         * @var {INTEGER} authorId
         */
        authorId: {
            allowNull: true,
            type: DataTypes.INTEGER
        }
    }, {paranoid: true});

    /**
     * Associates Log to other tables.
     *
     * @function associate
     * @param {Object} models - This var regroups models of all tables.
     * @returns {Promise} The promise to create associations.
     */
    Log.associate = function (models) {

        /**
         * Creates a singular association between Log and User
         * @function belongsToUser
         */
        Log.belongsTo(models.User, {
            foreignKey: 'authorId',
            as: 'author',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });

        /**
         * Creates plural associations between tables 'Log' and 'File'
         * @function belongsToManyFile
         */
        Log.belongsToMany(models.File, {
            as: 'files',
            through: models.FileLog,
            foreignKey: 'logId'
        });

        /**
         * Creates plural associations between tables 'Log' and 'User'
         * @function belongsToManyUser
         */
        Log.belongsToMany(models.User, {
            as: 'helpers',
            through: models.LogUser,
            foreignKey: 'logId'
        });
    };

    return Log;
};
