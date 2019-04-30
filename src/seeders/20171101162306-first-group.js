'use strict';

const ModulesFactory = require('../modules');
const modules = new ModulesFactory();
const db = modules.db;


module.exports = {
    up: (queryInterface) => queryInterface.bulkInsert('Groups', [
        {name: 'root'},
        {name: 'authors'},
        {name : 'organizers'}
    ])
        .then(() => {
            const rootUser = db.User.findOne({where: {username: 'root'}});

            /* eslint-disable promise/no-nesting */
            const addRootGroup = db.Group.findOne({where: {name: 'root'}})
                .then((group) => rootUser.then((root) => root.addGroup(group.id)));

            return Promise.all([
                addRootGroup
            ]);
        })
        .catch((err) => console.log(err)),

    down: (queryInterface) => queryInterface.bulkDelete('Groups', null, {})
};
