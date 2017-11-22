'use strict';

const db = require('../models');

exports.index = function (req, res, handle) {
    db.Group.findAll({include: ['users']}).
        then((group) => res.json(group)).
        catch((err) => handle(err));
};

exports.show = function (req, res, handle) {
    db.Group.findOne({
        where: {id: req.params.groupId},
        include: ['users']
    }).
        then((group) => {
            if (!group) {
                throw res.boom.notFound();
            } else {
                res.status(200).json(group);
            }
        }).
        catch((err) => handle(err));
};

exports.store = function (req, res, handle) {

    /*
     * To lower case to avoid security problems
     * (users trying to create 'auTHOrs' group to gain rights)
     */
    if (typeof req.body.name !== 'undefined') {
        req.body.name = req.body.name.toLowerCase();
    }


    db.Group.create(req.body).
        then((group) => res.status(201).json(group)).
        catch(db.Sequelize.ValidationError, (err) => res.boom.badRequest()).
        catch((err) => handle(err));
};

exports.update = function (req, res, handle) {

    /*
     * To lower case to avoid security problems
     * (users trying to create 'auTHOrs' group to gain rights)
     */
    if (typeof req.body.name !== 'undefined') {
        req.body.name = req.body.name.toLowerCase();
    }

    db.Group.update(req.body, {where: {id: req.params.groupId}}).
        then((result) => res.status(204).json({})).
        catch(db.Sequelize.ValidationError, (err) => res.boom.badRequest()).
        catch((err) => handle(err));
};

exports.delete = function (req, res, handle) {
    db.Group.destroy({where: {id: req.params.groupId}}).
        then((data) => {

            /*
             *Data :
             * [0] : number of rows corresponding to request
             * [1] : number of affected rows
             */

            if (!data[0]) {
                throw res.boom.badImplementation('Missing data !');
            }

            if (data[0] === 1) {
                res.status(204).json({});
            } else if (data[0] === 0) {
                throw res.boom.notFound();
            } else {
                throw res.boom.badImplementation('Too many rows deleted !');
            }
        }).
        catch((err) => handle(err));
};
