'use strict';

const db = require('../models');


/*
 *
 * Checks if a user is an author
 * To do so, find wheter one of its group has name "author"
 *
 * Returns: promise (the author group if resolved, )
 *
 */
const userIsAuthor = async (userId) => {
    const user = await db.User.findById(userId, {include: ['groups']});

    if (user && user.groups) {

        /*
         * Find the 'authors' group in the group names
         * and cast the value to boolean
         */

        return Boolean(user.groups
            .map((group) => group.name)
            .find((name) => name === 'authors'));
    }

    return [];

};

exports.filterIndex = (posts, userId) =>

    // Only show drafts is user is an author
    userIsAuthor(userId)
        .then((isAuthor) => {
            if (isAuthor) {
                return posts;
            }

            if (Array.isArray(posts)) {
                return posts.filter((post) => post.published);
            }

            return [];

        });


exports.filterShow = (post, userId) =>

    // Only show drafts is user is an author
    userIsAuthor(userId)
        .then((isAuthor) => {
            if (post.published || isAuthor) {
                return post;
            }

            return {};

        });


exports.filterStore = (userId) =>

    // Only allow creation if user is an author
    userIsAuthor(userId)
        .then((isAuthor) => {
            if (isAuthor) {
                return true;
            }

            throw new Error('Unauthorized');

        });


exports.filterUpdate = (userId) =>

    // Only allow update if user is an author
    userIsAuthor(userId)
        .then((isAuthor) => {
            if (isAuthor) {
                return true;
            }

            throw new Error('Unauthorized');


        });


exports.filterDelete = (userId) =>

    // Only allow delete if user is an author
    userIsAuthor(userId)
        .then((isAuthor) => {
            if (isAuthor) {
                return true;
            }

            throw new Error('Unauthorized');
        });


