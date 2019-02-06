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
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('Missions', 'markdown', {type: Sequelize.TEXT});
        await queryInterface.changeColumn('Missions', 'description', {type: Sequelize.TEXT});

        return true;
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
    down: asyc (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('Missions', 'markdown', {type: Sequelize.STRING});
        await queryInterface.changeColumn('Missions', 'description', {type: Sequelize.STRING});

        return true;
    }
};
