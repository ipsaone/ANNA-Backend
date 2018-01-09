'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        queryInterface.addColumn('Events', 'startDate', {
            allowNull: false,
            type: Sequelize.DATE
        });

        queryInterface.addColumn('Events', 'endDate', {
            allowNull: true,
            type: Sequelize.DATE
        });
    },

    down: (queryInterface) => {
        queryInterface.removeColumn('Events', 'startDate');
        queryInterface.removeColumn('Events', 'endDate');
    }
};
