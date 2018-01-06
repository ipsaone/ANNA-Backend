'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        queryInterface.changeColumn('Missions', 'markdown', {type: Sequelize.TEXT});
        queryInterface.changeColumn('Missions', 'description', {type: Sequelize.TEXT});
    },

    down: (queryInterface, Sequelize) => {
        queryInterface.changeColumn('Missions', 'markdown', {type: Sequelize.STRING});
        queryInterface.changeColumn('Missions', 'description', {type: Sequelize.STRING});
    }
};
