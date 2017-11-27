'use strict';

const db = require('../models');
const policy = require('../policies/post_policy');

exports.index = function (req, res, handle) {

    /*
     * GET /posts                 -> return all posts
     * GET /posts?published=true  -> return all published posts
     * GET /posts?published=false -> return all drafted posts
     */
    let posts = db.Post;

    if (req.query.published) {
        if (req.query.published === 'true') {
            posts = posts.scope('published');
        } else if (req.query.published === 'false') {
            posts = posts.scope('draft');
        }
    }

    posts.findAll({
        include: ['author'],
        order: [
            [
                'createdAt',
                'DESC'
            ]
        ]
    }).
        then((postsResponse) => policy.filterIndex(req, res, postsResponse)).
        then((postsFiltered) => res.status(200).json(postsFiltered)).
        catch((err) => handle(err));
};

exports.show = function (req, res, handle) {
    db.Post.findOne({
        where: {id: req.params.postId},
        include: ['author']
    }).
        then((post) => {
            if (!post) {
                throw res.boom.notFound();
            }

            return post;
        }).
        then((post) => policy.filterShow(req, post)).
        then((post) => res.status(200).json(post)).
        catch((err) => handle(err));
};

exports.store = function (req, res, handle) {
    policy.filterStore(req, res).
        then(() => db.Post.create(req.body)).
        then((post) => res.status(201).json(post)).
        catch(db.Sequelize.ValidationError, () => res.boom.badRequest()).
        catch((err) => handle(err));
};

exports.update = function (req, res, handle) {
    policy.filterUpdate(req, res).
        then(() => db.Post.update(req.body, {where: {id: req.params.postId}})).
        then((post) => res.status(200).json(post)).
        catch(db.Sequelize.ValidationError, () => res.boom.badRequest()).
        catch((err) => handle(err));
};

exports.delete = function (req, res, handle) {
    policy.filterDelete(req, res).
        then(() => db.Post.destroy({where: {id: req.params.postId}})).
        then(() => res.status(204).json({})).
        catch(db.Sequelize.ValidationError, () => res.boom.badRequest()).
        catch((err) => handle(err));
};
