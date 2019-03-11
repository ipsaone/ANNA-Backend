'use strict';


module.exports = {

    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Events', 'startDate', {
            allowNull: false,
            type: Sequelize.DATE
        });

        await queryInterface.addColumn('Events', 'endDate', {
            allowNull: true,
            type: Sequelize.DATE
        });

        return true;
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn('Events', 'startDate');
        await queryInterface.removeColumn('Events', 'endDate');

        return true;
    }
};
