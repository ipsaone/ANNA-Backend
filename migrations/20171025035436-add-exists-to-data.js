'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        queryInterface.addColumn('Data', 'exists', {
            allowNull: false,
            defaultValue: true,
            type: Sequelize.BOOLEAN
        });
    },

    down: (queryInterface) => {
        queryInterface.removeColumn('Data', 'exists');
    }
};
