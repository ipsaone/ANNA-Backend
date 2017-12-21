'use strict';

/**
 * Creates table 'Groups'
 * @module createGroups
 * @implements {up}
 * @implements {down}
 */

module.exports = {
  /**
   * Sets table 'Groups'
   * @function up
   * @implements {id}
   * @implements {name}
   */
    up: (queryInterface, Sequelize) => queryInterface.createTable('Groups', {
      /**
       * The id of the group
       * @var id
       */
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        /**
         * The name of the group
         * @var name
         */
        name: {
            allowNull: false,
            type: Sequelize.STRING
        }
    }),
    /**
     * Resets table 'Groups'
     * @function down
     */
    down: (queryInterface) => queryInterface.dropTable('Groups')
};
