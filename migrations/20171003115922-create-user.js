'use strict';

/**
 * Creates table 'Users'
 * @module createUsers
 * @implements {up}
 * @implements {down}
 */


module.exports = {
  /**
   * Sets table 'Users'
   * @function up
   * @implements {id}
   * @implements {username}
   * @implements {password}
   * @implements {email}
   * @implements {createdAt}
   * @implements {updatedAt}
   */
    up: (queryInterface, Sequelize) => queryInterface.createTable('Users', {
      /**
       * The id of the user
       * @var id
       */
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        /**
         * The username of the user
         * @var username
         */
        username: {
            allowNull: false,
            type: Sequelize.STRING,
            unique: true
        },
        /**
         * The user's password
         * @var password
         */
        password: {
            allowNull: false,
            type: Sequelize.STRING
        },
        /**
         * The user's email adress
         * @var email
         */
        email: {
            allowNull: false,
            type: Sequelize.STRING,
            unique: true
        },
        /**
         * The user's registration date
         * @var createdAt
         */
        createdAt: {
            allowNull: false,
            type: Sequelize.DATE
        },
        /**
         * The date of the last update of the user's data
         * @var updatedAt
         */
        updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
        }
    }),
    /**
     * Resets the table 'Users'
     * @function down
     */
    down: (queryInterface) => queryInterface.dropTable('Users')
};
