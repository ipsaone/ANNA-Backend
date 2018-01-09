'use strict';

/**
 * @file Manages the table containing all posts in the database
 * @see {@link module:createPosts}
 */

/**
 * Creates table 'Posts'
 * @module createPosts
 * @implements {up}
 * @implements {down}
 */
 
module.exports = {

    /**
     * Sets table 'Posts'.
     *
     * @function up
     *
     * @param {Object} queryInterface - A query interface.
     * @param {Object} Sequelize - The Sequelize object.
     *
     * @implements {id}
     * @implements {title}
     * @implements {markdown}
     * @implements {content}
     * @implements {authorId}
     * @implements {published}
     * @implements {publishedAt}
     * @implements {updatedAt}
     *
     * @returns {Promise} The promise to create a table.
     *
     */
    up: (queryInterface, Sequelize) => queryInterface.createTable('Posts', {

        /**
         * The id of the post
         * @var {INTEGER} id
         */
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        /**
         * The title of the post
         * @var {STRING} title
         */
        title: {
            allowNull: false,
            type: Sequelize.STRING,
            unique: true
        },

        /**
         * The content sent by the author
         * @var {TEXT} markdown
         */
        markdown: {
            allowNull: false,
            type: Sequelize.TEXT
        },

        /**
         * The content seen by the user
         * @var {TEXT} content
         */
        content: {
            allowNull: false,
            type: Sequelize.TEXT
        },

        /**
         * The id of the author
         * @var {INTEGER} authorId
         */
        authorId: {
            allowNull: true,
            type: Sequelize.INTEGER,
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            references: {
                model: 'Users',
                key: 'id'
            }
        },

        /**
         * Boolean that indicates if the post is published or a draft
         * @var {BOOLEAN} published
         */
        published: {
            allowNull: false,
            defaultValue: false,
            type: Sequelize.BOOLEAN
        },

        /**
         * The date of publication of the Posts
         * @var {DATE} publishedAt
         */
        publishedAt: {type: Sequelize.DATE},
        createdAt: {
            allowNull: false,
            type: Sequelize.DATE
        },

        /**
         * The date of the last update of the post
         * @var {DATE} updatedAt
         */
        updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
        }
    }),

    /**
     * Resets the table 'Posts'.
     *
     * @function down
     * @param {Object} queryInterface - A query interface.
     * @returns {Promise} The promise to drop a table.
     */
    down: (queryInterface) => queryInterface.dropTable('Posts')
};
