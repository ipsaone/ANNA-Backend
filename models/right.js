'use strict';


/**
 * @file Defines a model for 'Right' table and creates its associations with the other tables
 * @see {@link module:right}
 */

/**
 * @module right
 */

/**
 * @function exports
 *
 * @param {Object} sequelize - The Sequelize object.
 * @param {Object} DataTypes - DataTypes.
 *
 * @returns {Object} Returns Right.
 *
 */
module.exports = (sequelize, DataTypes) => {

    /**
     * Defines a mapping between model and table 'Post'
     * @function Right
     *
     * @param {Obect} Right The table defined by the function
     *
     * @implements {groupWrite}
     * @implements {groupRead}
     * @implements {ownerWrite}
     * @implements {ownerRead}
     * @implements {allWrite}
     * @implements {allRead}
     *
     * @returns {Object} Right
     */
    const Right = sequelize.define('Right', {

        /**
         * Shows the writing rights of a group
         * @var {BOOLEAN} groupWrite
         */
        groupWrite: {
            allowNull: false,
            defaultValue: false,
            type: DataTypes.BOOLEAN
        },

        /**
         * Shows the reading rights of a group
         * @var {BOOLEAN} groupRead
         */
        groupRead: {
            allowNull: false,
            defaultValue: false,
            type: DataTypes.BOOLEAN
        },

        /**
         * Shows the writinng rights of the owner
         * @var {BOOLEAN} ownerWrite
         */
        ownerWrite: {
            allowNull: false,
            defaultValue: false,
            type: DataTypes.BOOLEAN
        },
        ownerRead: {

            /**
             * Shows the reading rights of the owner
             * @var {BOOLEAN} ownerRead
             */
            allowNull: false,
            defaultValue: false,
            type: DataTypes.BOOLEAN
        },

        /**
         * Shows the writing rights of all users
         * @var {BOOLEAN} allWrite
         */
        allWrite: {
            allowNull: false,
            defaultValue: false,
            type: DataTypes.BOOLEAN
        },

        /**
         * Shows the reading rights of all users
         * @var {BOOLEAN} allRead
         */
        allRead: {
            allowNull: false,
            defaultValue: false,
            type: DataTypes.BOOLEAN
        }
    }, {timestamps: false});


    return Right;
};
