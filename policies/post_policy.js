'use strict';

const db = require('../models')


/*
 *
 * Checks if a user is an author
 * To do so, find wheter one of its group has name "author"
 *
 * Returns: promise (the author group if resolved, )
 *
 */
const userIsAuthor = (userId) => db.User.findOne({
    where: {id: userId},
    include: ['groups']
}).
    then((user) => {
        if (user && user.groups) {
            return user.groups;
        }

        return [];

    }).

    // No case checking needed, they are stored lowercase
    then((groups) => groups.find((group) => group.name === 'authors')).

    // Return an error or the group
    then((group) => typeof group !== 'undefined')

exports.filterIndex = (req, res, posts) =>

    // Only show drafts is user is an author
    userIsAuthor(req.session.auth).
        then((isAuthor) => {
            if (isAuthor) {
                return posts;
            }

            return Array.isArray(posts) ? posts.filter((post) => post.published) : [];

        })


exports.filterShow = (req, post) =>

    // Only show drafts is user is an author
    userIsAuthor(req.session.auth).
        then((isAuthor) => post.published || isAuthor ? post : {})


exports.filterStore = (req, res) =>

    // Only allow creation if user is an author
    userIsAuthor(req.session.auth).
        then((isAuthor) => isAuthor ? true : Promise.reject(res.boom.unauthorized()))


exports.filterUpdate = (req, res) =>

    // Only allow update if user is an author
    userIsAuthor(req.session.auth).
        then((isAuthor) => isAuthor ? true : Promise.reject(res.boom.unauthorized()))


exports.filterDelete = (req, res) =>

    // Only allow delete if user is an author
    userIsAuthor(req.session.auth).
        then((isAuthor) => isAuthor ? true : Promise.reject(res.boom.unauthorized()))


