'use strict';

const policy = require('../post_policy');
const joi = require('@hapi/joi');
const schema = joi.object().keys({});


module.exports = (db) => async function (req, res) {
    const postId = parseInt(req.params.postId, 10);
    req.transaction.logger.info('Post deletion controller invoked', {postId});

    // Validate user input
    const validation = schema.validate(req.body);
    req.transaction.logger.debug('Validating schema');

    if (validation.error) {
        req.transaction.logger.debug('Bad input', {body : req.body});
        return res.boom.badRequest(validation.error);
    }

    req.transaction.logger.info('Deleting post');
    db.Post.destroy({where: {id: postId}});

    req.transaction.logger.info('Sending response');
    return res.status(204).json({});
};
