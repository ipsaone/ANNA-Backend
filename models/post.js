'use strict';

const marked = require('marked');

module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define('Post', {
        title: {allowNull: false, type: DataTypes.STRING},
        markdown: {
            allowNull: false,
            type: DataTypes.TEXT,
            set (val) {
                this.setDataValue('markdown', val); // Set this field with the raw markdown
                this.setDataValue('content', marked(val));
            }
        },
        content: {allowNull: false, type: DataTypes.TEXT},
        authorId: {allowNull: false, type: DataTypes.INTEGER},
        published: {
            allowNull: false,
            defaultValue: false,
            type: DataTypes.BOOLEAN,
            set (val) {
                if (val) this.setDataValue('publishedAt', Date.now());
                else this.setDataValue('publishedAt', null);

                this.setDataValue('published', val);
            }
        },
        publishedAt: DataTypes.DATE
    }, {
        scopes: {
            draft: {
                where: {published: false}
            },
            published: {
                where: {published: true}
            }
        }
    });

    Post.associate = function (models) {
        Post.belongsTo(models.User, {foreignKey: 'authorId', as: 'author', onDelete: 'SET NULL', onUpdate: 'CASCADE'});
    };

    return Post;
};
