'use strict';

const boom = require('boom');
const db = require('../models')


//
// Checks if a user is an author
// To do so, find wheter one of its group has name "author"
//
// Returns: promise (the author group if resolved, a boom error if rejected)
//
let userIsAuthor = (userId) => {
    return db.User.findOne({where: {id: userId}})
        .then(user => user.getGroups())

        // No case checking needed, they are stored lowercase
        .then(groups => groups.find(group => group.name === "authors"))

        // Return an error or the group
        .then(group => typeof(group) !== 'undefined')
}

exports.filterIndex = (req, posts) => {

    // Only show drafts is user is an author
    return userIsAuthor(req.session.auth)
      .then(isAuthor => isAuthor ? posts : posts.filter(post => post.published))


}

exports.filterShow = (req, post) => {

    // Only show drafts is user is an author
    return userIsAuthor(req.session.auth)
        .then(isAuthor => (post.published || isAuthor) ? post : {})
}

exports.filterStore = (req) => {

    return userIsAuthor(req.session.auth)
        .then(isAuthor => isAuthor ? true : Promise.reject(boom.unauthorized()));

}

exports.filterUpdate = (req) => {

    return userIsAuthor(req.session.auth)
        .then(isAuthor => isAuthor ? true : Promise.reject(boom.unauthorized()));

}
