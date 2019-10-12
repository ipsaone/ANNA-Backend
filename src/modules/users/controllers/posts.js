'use strict';

const policy = require('../user_policy.js');


module.exports = (db) => async function (req, res) {
    if (isNaN(parseInt(req.params.userId, 10))) {
        req.transaction.logger.info('User ID must be an integer');
        throw res.boom.badRequest('User ID must be an integer');
    }
    const userId = parseInt(req.params.userId, 10);

    req.transaction.logger.info('Invoking policies');
    let filteredUser = await policy.filterIndexPosts(req.transaction);
    if(!filteredUser) {
        req.transaction.logger.info('Policies denied access');
        return res.boom.unauthorized();
    }

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
