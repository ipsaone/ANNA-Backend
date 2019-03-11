'use strict';

module.exports = {

    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('Missions', 'markdown', {type: Sequelize.TEXT});
        await queryInterface.changeColumn('Missions', 'description', {type: Sequelize.TEXT});

        return true;
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('Missions', 'markdown', {type: Sequelize.STRING});
        await queryInterface.changeColumn('Missions', 'description', {type: Sequelize.STRING});

        return true;
    }
};
