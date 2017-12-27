'use strict';

/**
 * Creates table 'Posts'
 * @module createPosts
 * @implements {up}
 * @implements {down}
 */


module.exports = {

    /*
     * Set table 'Posts'
     * @function up
     * @implements {id}
     * @implements {title}
     * @implements {markdown}
     * @implements {content}
     * @implements {authorId}
     * @implements {published}
     * @implements {publishedAt}
     * @implements {updatedAt}
     */
    up: (queryInterface, Sequelize) => queryInterface.createTable('Posts', {

        /**
         * The id of the post
         * @var id
         */
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        /**
         * The title of the post
         * @var title
         */
        title: {
            allowNull: false,
            type: Sequelize.STRING,
            unique: true
        },

        /**
         * The content sent by the author
         * @var markdown
         */
        markdown: {
            allowNull: false,
            type: Sequelize.TEXT
        },

        /**
         * The content seen by the user
         * @var content
         */
        content: {
            allowNull: false,
            type: Sequelize.TEXT
        },

        /**
         * The id of the author
         * @var authorId
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
         * @var published
         */
        published: {
            allowNull: false,
            defaultValue: false,
            type: Sequelize.BOOLEAN
        },

        /**
         * The date of publication of the Posts
         * @var publishedAt
         */
        publishedAt: {type: Sequelize.DATE},
        createdAt: {
            allowNull: false,
            type: Sequelize.DATE
        },

        /**
         * The date of the last update of the post
         * @var updatedAt
         */
        updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
        }
    }),

    /*
     * Reset the table 'Posts'
     * @function down
     */
    down: (queryInterface) => queryInterface.dropTable('Posts')
};
