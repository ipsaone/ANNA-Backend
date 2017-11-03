'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        queryInterface.addColumn('Data', 'exists', {
            allowNull: false,
            defaultValue: true,
            type: Sequelize.BOOLEAN
        });
    },

    down: (queryInterface, Sequelize) => {
        queryInterface.removeColumn('Data', 'exists');
    }
};
