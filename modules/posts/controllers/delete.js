'use strict';

const policy = require('../post_policy');

/**
 *
 * Deletes an existing post.
 *
 * @param {obj} req     - The user request.
 * @param {obj} res     - The response to be sent.
 * @param {obj} handle  - The error handling function.
 *
 * @returns {Object} Promise.
 *
 */

module.exports = (db) => function (req, res, handle) {
    if (isNaN(parseInt(req.params.postId, 10))) {
        throw res.boom.badRequest('Post ID must be an integer');
    }
    const postId = parseInt(req.params.postId, 10);

    return policy.filterDelete(db, req.session.auth)
        .then(() => db.Post.destroy({where: {id: postId}}))
        .then(() => res.status(204).json({}))
        .catch(err => {if (err instanceof db.Sequelize.ValidationError) {return res.boom.badRequest();}})
        .catch((err) => handle(err));
};
