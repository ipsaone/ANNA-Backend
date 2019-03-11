'use strict';

const policy = require('../post_policy');



module.exports = (db) => async function (req, res) {

    req.transaction.logger.info('Listing posts');

    let posts = db.Post;

    if (req.query.published) {
        if (req.query.published === 'true') {
            req.transaction.logger.info('Scoping only published posts');
            posts = posts.scope('published');
        } else if (req.query.published === 'false') {
            req.transaction.logger.info('Scoping only drafted posts');
            posts = posts.scope('draft');
        }
    }

    req.transaction.logger.debug('Retrieving posts');
    let postsResponse = await posts.findAll({
        include: ['author'],
        order: [
            [
                'createdAt',
                'DESC'
            ]
        ]
    })

    req.transaction.logger.debug('Filtering posts');
    let postsFiltered = await policy.filterIndex(db, postsResponse, req.session.auth);

    req.transaction.logger.info('Sending response posts');
    return res.status(200).json(postsFiltered);
};
