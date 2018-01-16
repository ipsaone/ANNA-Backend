'use strict';

/**
 * @file Allows to change a mission markdown description
 * @see {@link module:changeMissionMarkdownDescription}
 */

/**
 * @module changeMissionMarkdownDescription
 * @implements {up}
 * @implements {down}
 */

module.exports = {

    /**
     * Changes columns 'markdown' and 'description' from table 'Missions'.
     *
     * @function up
     *
     * @param {Object} queryInterface - A query interface.
     * @param {Object} Sequelize - The Sequelize object.
     *
     * @returns {Promise} The promise change columns.
     *
     */
    up: (queryInterface, Sequelize) => {
        queryInterface.changeColumn('Missions', 'markdown', {type: Sequelize.TEXT});
        queryInterface.changeColumn('Missions', 'description', {type: Sequelize.TEXT});
    },

    /**
     * Changes columns 'markdown' and 'description' from table 'Missions'.
     *
     * @function down
     *
     * @param {Object} queryInterface - A query interface.
     * @param {Object} Sequelize - The Sequelize object.
     *
     * @returns {Promise} The promise change columns.
     *
     */
    down: (queryInterface, Sequelize) => {
        queryInterface.changeColumn('Missions', 'markdown', {type: Sequelize.STRING});
        queryInterface.changeColumn('Missions', 'description', {type: Sequelize.STRING});
    }
};
