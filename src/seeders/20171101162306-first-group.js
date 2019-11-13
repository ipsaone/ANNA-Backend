'use strict';

const ModulesFactory = require('../modules');


module.exports = {
    up: async (queryInterface) => {
        await queryInterface.bulkInsert('Groups', [
            {name: 'root', id: 1},
            {name: 'authors', id: 2},
            {name : 'organizers', id: 3},
            {name: 'default', id: 4}
        ])
            
        await queryInterface.bulkInsert('UserGroup', [
            {id: 1, userId: 1, groupId: 1},
            {id: 2, userId: 1, groupId: 2},
            {id: 3, userId: 1, groupId: 3},
            {id: 4, userId: 1, groupId: 4}
        ])
        
    },

    down: (queryInterface) => queryInterface.bulkDelete('Groups', null, {})
};
