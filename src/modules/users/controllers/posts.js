'use strict';


module.exports = (db) => async function (req, res, handle) {
    if (isNaN(parseInt(req.params.userId, 10))) {
        throw res.boom.badRequest('User ID must be an integer');
    }
    const userId = parseInt(req.params.userId, 10);

    let posts = db.Post;

    if (req.query.published) {
        if (req.query.published === 'true') {
            posts = posts.scope('published');
        } else if (req.query.published === 'false') {
            posts = posts.scope('draft');
        }
    }

    let response = await posts.findAll({where: {authorId: userId}});
    return res.status(200).json(response);
};
