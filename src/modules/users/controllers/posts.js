'use strict';


module.exports = (db) => async function (req, res, handle) {
    if (isNaN(parseInt(req.params.userId, 10))) {
        req.transaction.logger.info('User ID must be an integer');
        throw res.boom.badRequest('User ID must be an integer');
    }
    const userId = parseInt(req.params.userId, 10);

    let posts = db.Post;
    if (req.query.published) {
        if (req.query.published === 'true') {
            req.transaction.logger.info('Scoping published posts only');
            posts = posts.scope('published');
        } else if (req.query.published === 'false') {
            req.transaction.logger.info('Scoping drafter posts only');
            posts = posts.scope('draft');
        }
    }
    
    req.transaction.logger.info('Finding posts');
    let response = await posts.findAll({where: {authorId: userId}});

    req.transaction.logger.info('Sending posts');
    return res.status(200).json(response);
};
