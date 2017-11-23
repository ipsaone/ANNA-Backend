'use strict';

const db = require('../models');

module.exports = {
    up: (queryInterface, Sequelize) => queryInterface.bulkInsert('Groups', [
        {name: 'root'},
        {name: 'authors'}
    ]).
        then(() => db.Group.findOne({where: {name: 'root'}})).
        then((group) => db.User.findOne({where: {username: 'root'}}).
            then((root) => root.addGroup(group.id))).
        then(() => db.Group.findOne({where: {name: 'authors'}})).
        then((group) => db.User.findOne({where: {username: 'root'}})).
        then((root) => root.addGroup(authors.id)).
        catch((err) => console.log(err)),

    down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Groups', null, {})
};
