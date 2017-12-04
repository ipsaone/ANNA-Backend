'use strict';

const db = require('../models');


module.exports = {
    up: (queryInterface) => queryInterface.bulkInsert('Groups', [
        {name: 'root'},
        {name: 'authors'}
    ]).
        then(() => {
            const rootUser = db.User.findOne({where: {username: 'root'}});

            const addRootGroup = db.Group.findOne({where: {name: 'root'}}).
                then((group) => rootUser.then((root) => root.addGroup(group.id)));

            const addAuthorsGroup = db.Group.findOne({where: {name: 'authors'}}).
                then((group) => rootUser.then((root) => root.addGroup(group.id)));

            return Promise.all([
                addRootGroup,
                addAuthorsGroup
            ]);
        }).
        catch((err) => console.log(err)),

    down: (queryInterface) => queryInterface.bulkDelete('Groups', null, {})
};
