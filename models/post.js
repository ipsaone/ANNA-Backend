'use strict';

/**
 * @file Defines a model for 'Post' table and creates its associations with the other tables
 * @see {@link module:post}
 */

/**
 * @module post
 */

const marked = require('marked');

/**
 * @function exports
 *
 * @param {Object} sequelize - The Sequelize object.
 * @param {Object} DataTypes - DataTypes.
 *
 * @returns {Object} Returns Post.
 *
 */
module.exports = (sequelize, DataTypes) => {

    /**
     * Defines a mapping between model and table 'Post'
     * @function Post
     *
     * @param {Obect} Post The table defined by the function
     *
     * @implements {title}
     * @implements {markdown}
     * @implements {content}
     * @implements {authorId}
     * @implements {published}
     * @implements {publishedAt}
     * @implements {scopes}
     *
     * @returns {Object} Mission
     */
    const Post = sequelize.define('Post', {

        /**
         * The title of the post
         * @var {STRING} title
         */
        title: {
            allowNull: false,
            type: DataTypes.STRING
        },

        /**
         * The content sent by the author of the post
         * @var {TEXT} markdown
         */
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
         * The id of the author of the post
         * @var {INTEGER} authorId
         */
        authorId: {
            allowNull: true,
            type: DataTypes.INTEGER
        },

        /**
         * Indicates if the post was published or not
         * @var {BOOLEAN} published
         */
        published: {
            allowNull: false,
            defaultValue: false,
            type: DataTypes.BOOLEAN,
            set (val) {
                if (val) {
                    this.setDataValue('publishedAt', Date.now());
                } else {
                    this.setDataValue('publishedAt', null);
                }

                this.setDataValue('published', val);
            }
        },

        /**
         * The date of publication of the post
         * @var {DATE} publishedAt
         */
        publishedAt: DataTypes.DATE
    }, {

        /**
         * @var scopes
         */
        scopes: {
            draft: {where: {published: false}},
            published: {where: {published: true}}
        }
    });

    /**
     * Associates Post to other tables.
     *
     * @function associate
     * @param {Object} models - This var regroups models of all tables.
     * @returns {Promise} The promise to create associations.
     */
    Post.associate = function (models) {

        /**
         * Creates singular association between table 'Post' and 'User'
         * @function belongsToUser
         */
        Post.belongsTo(models.User, {
            foreignKey: 'authorId',
            as: 'author',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        });
    };

    return Post;
};
