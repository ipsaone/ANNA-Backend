'use strict';

const db = require('../models');


module.exports = {
    up: (queryInterface) => queryInterface.bulkInsert('Groups', [
        {name: 'root'},
        {name: 'authors'}
    ]).
        then(() => {
            const rootUser = db.User.findOne({where: {username: 'root'}});

            /* eslint-disable promise/no-nesting */
            const addRootGroup = db.Group.findOne({where: {name: 'root'}}).
                then((group) => rootUser.then((root) => root.addGroup(group.id)));


            const addAuthorsGroup = db.Group.findOne({where: {name: 'authors'}}).
                then((group) => rootUser.then((root) => root.addGroup(group.id)));
            /* eslint-enable promise/no-nesting */

            return Promise.all([
                addRootGroup,
                addAuthorsGroup
            ]);
        }).
        catch((err) => console.log(err)),

    down: (queryInterface) => queryInterface.bulkDelete('Groups', null, {})
};
