'use strict';

const db = require('../models');
const boom = require('boom');

exports.index = function (req, res, handle) {
    db.User.findAll().
        then((users) => res.status(200).json(users)).
        catch((err) => handle(err));
};


exports.show = function (req, res, handle) {
    db.User.findOne({
        where: {id: req.params.userId},
        include: ['groups']
    }).
        then((user) => {
            if (!user) {
                throw res.boom.badRequest();
            } else {
                res.status(200).json(user);
            }
        }).
        catch((err) => handle(err));
};


exports.store = function (req, res, handle) {
    db.User.create(req.body).
        then((user) => res.status(201).json(user)).
        catch(db.Sequelize.ValidationError, (err) => res.boom.badRequest()).
        catch((err) => handle(err));
};


exports.update = function (req, res, handle) {
    db.User.findOne({where: {id: req.params.userId}}).
        then((record) => record.update(req.body)).
        then(() => res.status(204).json({})).
        catch(db.Sequelize.ValidationError, (err) => res.boom.badRequest()).
        catch((err) => handle(err));
};

exports.delete = function (req, res, handle) {
    db.User.destroy({where: {id: req.params.userId}}).
        then(() => res.status(204).send()).
        catch(db.Sequelize.ValidationError, (err) => res.boom.badRequest()).
        catch((err) => handle(err));
};

exports.posts = function (req, res, handle) {

    /*
     * GET /users/:userId/posts                 -> return all posts
     * GET /users/:userId/posts?published=true  -> return all published posts
     * GET /users/:userId/posts?published=false -> return all drafted posts
     */
    let posts = db.Post;

    if (req.query.published) {
        if (req.query.published === 'true') {
            posts = posts.scope('published');
        } else if (req.query.published === 'false') {
            posts = posts.scope('draft');
        }
    }

    posts.findAll({where: {authorId: req.params.userId}}).
        then((posts) => res.status(200).json(posts)).
        catch((err) => handle(err));
};


exports.get_groups = function (req, res, handle) {
    db.User.findOne({
        where: {id: req.params.userId},
        include: ['groups']
    }).
        then((user) => {
            if (!user) {
                throw res.boom.badRequest();
            } else {
                res.status(200).json(user.groups);
            }
        }).
        catch((err) => handle(err));
};

exports.add_groups = function (req, res) {
    db.User.findById(req.params.userId).
        then((user) => {
            if (!user) {
                throw res.boom.badRequest();
            } else {
                user.addGroups(req.body.groupsId);
            }
        }).
        then(() => res.status(204).send()).
        catch((err) => handle(err));
};


exports.delete_groups = function (req, res) {
    db.User.findById(req.params.userId).
        then((user) => user.removeGroups(req.body.groupsId)).
        then(() => res.status(204).send()).
        catch((err) => handle(err));
};
