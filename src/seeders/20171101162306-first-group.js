'use strict';

const ModulesFactory = require('../modules');


module.exports = {
    up: async (queryInterface) => {
        await queryInterface.bulkInsert('Groups', [
            {name: 'root', id: 1},
            {name: 'authors', id: 2},
            {name : 'organizers', id: 3}
        ])
            
        await queryInterface.bulkInsert('UserGroup', [
            {id: 1, userId: 1, groupId: 1}
        ])
        
    },

    down: (queryInterface) => queryInterface.bulkDelete('Groups', null, {})
};
