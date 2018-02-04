'use strict';

/**
 * @file
 * @see {@link module:post}
 */

/**
 * @module post
 */


/**
 * Checks if a user is an author.
 * To do so, find wheter one of its group has name "author".
 *
 * @function userIsAuthor
 *
 * @param {obj} db - The database.
 * @param {INTEGER} userId - The id of the user.
 *
 * @returns {Promise} The author group if resolved.
 */
const userIsAuthor = async (db, userId) => {
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

/**
 * Gets all published posts.
 * Only show drafts if user is an author.
 *
 * @function filterIndex
 *
 * @param {obj} db - The database.
 * @param {Object} posts - The object containing all posts.
 * @param {INTEGER} userId - The id of the user.
 *
 * @returns {Promise} An array containing all published posts if resolved.
 */
exports.filterIndex = (db, posts, userId) =>

    // Only show drafts if user is an author
    userIsAuthor(db, userId)
        .then((isAuthor) => {
            if (isAuthor) {
                return posts;
            }

            if (Array.isArray(posts)) {
                return posts.filter((post) => post.published);
            }

            return [];

        });

/**
 * Gets one post.
 * Only show drafts if user is an author.
 *
 * @function filterShow
 *
 * @param {obj} db - The database.
 * @param {Object} post - A post.
 * @param {INTEGER} userId - The id of the user.
 *
 * @returns {Promise} A post.
 */
exports.filterShow = (db, post, userId) =>

    // Only show drafts is user is an author.
    userIsAuthor(db, userId)
        .then((isAuthor) => {
            if (post.published || isAuthor) {
                return post;
            }

            return {};

        });

/**
 * Filters users who can create a post.
 * Only authors can create a post.
 *
 * @function filterStore
 *
 * @param {obj} db - The database.
 * @param {INTEGER} userId - The id of the user.
 *
 * @returns {boolean} Either user is an author or the function throws an error 'Unauthorized'.
 */
exports.filterStore = (db, userId) =>

    // Only allow creation if user is an author.
    userIsAuthor(db, userId)
        .then((isAuthor) => {
            if (isAuthor) {
                return true;
            }

            throw new Error('Unauthorized');

        });

/**
 * Filters users who can update a post.
 * Only authors can update a post.
 *
 * @function filterUpdate
 *
 * @param {obj} db - The database.
 * @param {INTEGER} userId - The id of the user.
 *
 * @returns {boolean} Either the user is an author or the function throws an error 'Unauthorized'.
 */
exports.filterUpdate = (db, userId) =>

    // Only allow update if user is an author
    userIsAuthor(db, userId)
        .then((isAuthor) => {
            if (isAuthor) {
                return true;
            }

            throw new Error('Unauthorized');


        });

/**
 * Filters users who can delete a post.
 * Only authors can delete a post.
 *
 * @function filterDelete
 *
 * @param {obj} db - The database.
 * @param {INTEGER} userId - The id of the user.
 *
 * @returns {boolean} Either the user is an author or the function throws an error 'Unauthorized'.
 */
exports.filterDelete = (db, userId) =>

    // Only allow delete if user is an author
    userIsAuthor(db, userId)
        .then((isAuthor) => {
            if (isAuthor) {
                return true;
            }

            throw new Error('Unauthorized');
        });
